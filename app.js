const express = require('express');
const app = express();
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');

// 1. Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {
    console.log('Hello from the middleware!');
    next();
});
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3. Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;

/*
200 = success
201 = create
204 = no longer exist (after delete)

404 = not found 

500 = internal server error
*/
