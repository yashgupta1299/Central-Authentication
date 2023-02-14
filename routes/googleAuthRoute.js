const express = require('express');
const authController = require('./../controllers/authController');
const passportSTA = require('../controllers/googleAuthControllers/googleAuthControllerSTA');
const passportGoogleLogin = require('../controllers/googleAuthControllers/googleAuthControllerGL');

const router = express.Router();
router.use(passportSTA.initialize());
router.use(passportGoogleLogin.initialize());

router.get(
    '/sta',
    passportSTA.authenticate('google', {
        session: false,
        scope: ['profile', 'email']
    })
);
router.get(
    '/sta/callback',
    passportSTA.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_DOMAIN}/?alert=authenticationFailed`,
        session: false
    }),
    authController.googleGetShortTimeAccessToken
);

router.get(
    '/forgotPassword',
    passportSTA.authenticate('google', {
        session: false,
        scope: ['profile', 'email']
    })
);
router.get(
    '/forgotPassword/callback',
    passportSTA.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_DOMAIN}/?alert=authenticationFailed`,
        session: false
    }),
    authController.googleGetShortTimeAccessToken
);

router.get(
    '/signInwithGoogle',
    passportGoogleLogin.authenticate('google', {
        session: false,
        scope: ['profile', 'email']
    })
);
router.get(
    '/signInwithGoogle/callback',
    passportGoogleLogin.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_DOMAIN}/?alert=authenticationFailed`,
        session: false
    }),
    authController.googleLogin
);

module.exports = router;
