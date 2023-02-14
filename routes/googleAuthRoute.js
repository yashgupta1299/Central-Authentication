const express = require('express');
const authController = require('./../controllers/authController');
const passportSTA = require('../controllers/googleAuthControllers/googleAuthControllerSTA');
const passportGoogleLogin = require('../controllers/googleAuthControllers/googleAuthControllerGL');

const router = express.Router();
// router.use(passportSTA.initialize());
// router.use(passportGoogleLogin.initialize());
router.get(
    '/sta',
    passportSTA.initialize(),
    passportSTA.authenticate('google', {
        session: false,
        scope: ['profile', 'email']
    })
);
router.get(
    '/sta/callback',
    passportSTA.initialize(),
    passportSTA.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_DOMAIN}/?alert=authenticationFailed`,
        session: false
    }),
    authController.googleGetShortTimeAccessToken
);

//

router.get(
    '/forgotPassword',
    passportSTA.initialize(),
    passportSTA.authenticate('google', {
        session: false,
        scope: ['profile', 'email']
    })
);
router.get(
    '/forgotPassword/callback',
    passportSTA.initialize(),
    passportSTA.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_DOMAIN}/?alert=authenticationFailed`,
        session: false
    }),
    authController.googleGetShortTimeAccessToken
);

//

router.get(
    '/signInwithGoogle',
    passportGoogleLogin.initialize(),
    passportGoogleLogin.authenticate('google', {
        session: false,
        scope: ['profile', 'email']
    })
);
router.get(
    '/signInwithGoogle/callback',
    passportGoogleLogin.initialize(),
    passportGoogleLogin.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_DOMAIN}/?alert=authenticationFailed`,
        session: false
    }),
    authController.googleLogin
);

module.exports = router;
