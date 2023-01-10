const AppError = require('./../utils/AppError');

// status is succeess or fail or error
const sendErrorDev = (err, req, res) => {
    // for API
    console.log('ERROR 🔥', err);
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, req, res) => {
    // for API

    // Operational, trusted error: send message to client
    if (err.isOperational) {
        console.log(err);
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // Programming or other unknown error: don't leak error details
    // Log error to see later in hosting site to fix it
    console.error('ERROR 🔥', err);
    // Send generic message as this is a new error
    res.status(err.statusCode).json({
        status: 'fail',
        title: 'Something went wrong!',
        message: 'Please try again later!'
    });
};

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};
const handleDuplicateFieldsDB = err => {
    let message;
    if (err.keyValue.name) {
        message = `field value, name: ${err.keyValue.name}, Already present please use another value!`;
    }
    if (err.keyValue.email) {
        message = `field value, email: ${err.keyValue.email}, Already present please use another value!`;
    }
    if (err.keyValue.tour && err.keyValue.user) {
        message = `Review already created, if you want to create another one then please delete first one!`;
    }
    return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};
const handleJsonWebTokenError = () => {
    return new AppError('Invalid token please log in again!', 401);
};
const handleTokenExpiredError = () => {
    return new AppError('Your token is expired please log in again!', 401);
};
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        // let error = { ...err }; // wrong
        let error = JSON.parse(JSON.stringify(err)); // deep copy
        error.message = err.message; // but still needs
        if (error.name === 'CastError') {
            error = handleCastErrorDB(error);
        }
        if (error.code === 11000) {
            // console.log('here', error);
            error = handleDuplicateFieldsDB(error);
        }
        if (error.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }
        if (err.name === 'JsonWebTokenError') {
            error = handleJsonWebTokenError();
        }
        if (err.name === 'TokenExpiredError') {
            error = handleTokenExpiredError();
        }
        sendErrorProd(error, req, res);
    }
};

/*
200 = success
201 = create
204 = no longer exist (after delete)
400 = bad request
401 = unauthorized
403 = authorization
404 = not found 
500 = internal server error
*/
