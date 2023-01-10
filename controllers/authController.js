const jwt = require('jsonwebtoken');
const { promisify } = require('util');
// const crypto = require('crypto');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/AppError');

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
                    res.cookie('jwt', tok, {
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
                                res.cookie('refreshToken', token, {
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
