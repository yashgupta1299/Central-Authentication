const jwt = require('jsonwebtoken');
const { promisify } = require('util');
// const crypto = require('crypto');
const jwksClient = require('jwks-rsa');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/AppError');

// obtaining public key from authentication server
const publicKey = async kid => {
    // kid is unique id given by creater to each jwk
    const client = jwksClient({
        jwksUri: 'http://127.0.0.1:3000/.well-known/jwks.json',
        cache: true,
        rateLimit: true
    });
    // we can obtain key according to kid value
    const key = await client.getSigningKey(kid);
    return key.getPublicKey();
};

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1. check wheather email and password is given or not
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    //2. check if user exists and password is correct or not
    const user = await User.findOne({ email }).select('+password');
    // password is original which is taken from user
    // user.passwor is coming from a database which is stored in hash form
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Please enter valid email or password', 401));
    }

    // everything is ok send jwt
    try {
        await promisify(jwt.sign)(
            { id: user.id },
            process.env.JWT_SECRET_KEY_STA,
            { expiresIn: '15min', algorithm: 'RS256' },
            async (err, tok) => {
                if (!err) {
                    // cookie for signup purpose
                    res.cookie('at', tok, {
                        expires: new Date(Date.now() + 15 * 60 * 1000),
                        // cannot be changed by browser
                        httpOnly: true,
                        // connection can be done only over https
                        secure:
                            req.secure ||
                            req.headers['x-forwarded-proto'] === 'https'
                    });

                    // creating another cookie as refresh token
                    await promisify(jwt.sign)(
                        { id: user.id },
                        process.env.JWT_SECRET_KEY_STA,
                        { expiresIn: '90d', algorithm: 'RS256' },
                        (error, token) => {
                            if (!err) {
                                // cookie for signup purpose
                                res.cookie('rt', token, {
                                    expires: new Date(
                                        Date.now() + 90 * 24 * 60 * 60 * 1000
                                    ),
                                    // cannot be changed by browser
                                    httpOnly: true,
                                    // connection can be done only over https
                                    secure:
                                        req.secure ||
                                        req.headers['x-forwarded-proto'] ===
                                            'https'
                                });

                                // another cookie for storing expiration time
                                res.cookie('tm', Date.now() + 10 * 60 * 1000, {
                                    expires: new Date(
                                        Date.now() + 90 * 24 * 60 * 60 * 1000
                                    ),
                                    // can be changed by browser
                                    httpOnly: false,
                                    // connection can be done only over https
                                    secure:
                                        req.secure ||
                                        req.headers['x-forwarded-proto'] ===
                                            'https'
                                });
                                res.status(200).json({
                                    status: 'success'
                                });
                            }
                        }
                    );
                }
            }
        );
    } catch (err) {
        res.status(400).json({
            status: 'fail'
        });
    }
});

exports.getAccessToken = catchAsync(async (req, res, next) => {
    //1. Check weather token is present or not and extract it if present
    let token;
    // note either give bearer token or cookie token
    if (process.env.NODE_ENV === 'development') {
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }
    }
    if (req.cookies && req.cookies.rt) {
        token = req.cookies.rt;
    }

    if (!token) {
        return next(
            new AppError(
                'you are not logged in please log in to get access',
                401
            )
        );
    }

    //2. verify the request token and if it failed promise is rejected
    let decoded;
    try {
        const kid = 'abcd';
        const pk = await publicKey(kid);
        decoded = await promisify(jwt.verify)(token, pk, {
            algorithm: ['RS256']
        });
    } catch (err) {
        return next(new AppError('Email authentication failed', 401));
    }

    //3. check if user still exists in our database
    const dbUser = await User.findById(decoded.id);
    if (!dbUser) {
        return next(new AppError('The user no longer exists!', 401));
    }

    //4. check if password is changed or not after the issue of token
    if (dbUser.isTokenIssuedBeforePassChanged(decoded.iat) === true) {
        return next(
            new AppError(
                'Password is recently changed, please log in again:',
                401
            )
        );
    }

    // all safe issue Access Token
    try {
        await promisify(jwt.sign)(
            { id: decoded.id },
            process.env.JWT_SECRET_KEY_STA,
            { expiresIn: '15min', algorithm: 'RS256' },
            async (err, tok) => {
                if (!err) {
                    // cookie for access token purpose
                    res.cookie('at', tok, {
                        expires: new Date(Date.now() + 15 * 60 * 1000),
                        // cannot be changed by browser
                        httpOnly: true,
                        // connection can be done only over https
                        secure:
                            req.secure ||
                            req.headers['x-forwarded-proto'] === 'https'
                    });

                    res.cookie('tm', Date.now() + 10 * 60 * 1000, {
                        expires: new Date(
                            Date.now() + 90 * 24 * 60 * 60 * 1000
                        ),
                        // can be changed by browser
                        httpOnly: false,
                        // connection can be done only over https
                        secure:
                            req.secure ||
                            req.headers['x-forwarded-proto'] === 'https'
                    });

                    res.status(200).json({
                        status: 'success'
                    });
                }
            }
        );
    } catch (err) {
        res.status(400).json({
            status: 'fail'
        });
    }
});
