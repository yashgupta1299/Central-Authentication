const express = require('express');
const authController = require('./../controllers/authController');
const passport = require('../controllers/googleAuthController');

const router = express.Router();
router.use(passport.initialize());

router.get(
    '/sta',
    passport.authenticate('google', {
        session: false,
        scope: ['profile', 'email']
    })
);
router.get(
    '/sta/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_DOMAIN}/?alert=authenticationFailed`,
        session: false
    }),
    authController.googleGetShortTimeAccessToken
);

router.get(
    '/forgotPassword',
    passport.authenticate('google', {
        session: false,
        scope: ['profile', 'email']
    })
);
router.get(
    '/forgotPassword/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_DOMAIN}/?alert=authenticationFailed`,
        session: false
    }),
    authController.googleGetShortTimeAccessToken
);

router.get(
    '/signInwithGoogle',
    passport.authenticate('google', {
        session: false,
        scope: ['profile', 'email']
    })
);
router.get(
    '/signInwithGoogle/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_DOMAIN}/?alert=authenticationFailed`,
        session: false
    }),
    authController.googleGetShortTimeAccessToken
);

module.exports = router;
