const express = require('express');

const router = express.Router();

const passport = require('../controllers/googleAuthController');

router.use(passport.initialize());

//////

router.get(
    '/',
    passport.authenticate('google', {
        session: false,
        scope: ['profile', 'email']
    })
);

////

router.get(
    '/callback',
    passport.authenticate('google', {
        failureRedirect: '/?alert=authenticationFailed',
        session: false
    }),
    (req, res) => {
        // sending jwt with id=email, and 10 min validity so that i can use this
        // cookie for signup purpose
        res.cookie('jwt', req.user.token, {
            expires: new Date(Date.now() + 10 * 60 * 1000),
            // cannot be changed by browser
            httpOnly: true,
            // connection can be done only over https
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
        });
        res.redirect(`http://127.0.0.1:4000/signup`);
        // res.status(200).json({
        //     status: 'success'
        // });
    }
);

////

module.exports = router;
