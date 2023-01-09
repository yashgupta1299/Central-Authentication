const jwt = require('jsonwebtoken');
// const util = require('util');
// const crypto = require('crypto');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/AppError');

const jwtSignToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendjwt = (user, statusCode, req, res) => {
    const token = jwtSignToken(user.id);

    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        // cannot be changed by browser
        httpOnly: true,
        // httpOnly: false,
        // connection can be done only over https
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });

    res.cookie('refreshToken', token, {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        // cannot be changed by browser
        httpOnly: true,
        // httpOnly: false,
        // connection can be done only over https
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });

    user.password = undefined;

    if (process.env.NODE_ENV === 'development') {
        res.status(statusCode).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } else {
        res.status(statusCode).json({
            status: 'success'
        });
    }
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

    // everything is ok
    createSendjwt(user, 201, req, res);
});

exports.logout = (req, res) => {
    // altered jwt so that verification failed when server reloads it
    // time expire sso that browser delete the cookie from itself
    res.cookie('jwt', 'logged-out', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
};
