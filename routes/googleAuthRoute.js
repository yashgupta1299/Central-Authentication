const express = require('express');
const authController = require('../controllers/authController');
const passportSTA = require('../controllers/googleAuthController');

const router = express.Router();
router.use(passportSTA.initialize());

router.get(
    '/sta',
    passportSTA.authenticate('shortTimeAccess', {
        session: false,
        scope: ['profile', 'email']
    })
);

router.get(
    '/sta/callback',
    passportSTA.authenticate('shortTimeAccess', {
        failureRedirect: `${process.env.FRONTEND_DOMAIN}/?alert=Authentication Failed`,
        session: false
    }),
    authController.googleGetShortTimeAccessToken
);

router.get(
    '/signInwithGoogle',
    passportSTA.authenticate('googleLogin', {
        session: false,
        scope: ['profile', 'email']
    })
);

router.get(
    '/signInwithGoogle/callback',
    passportSTA.authenticate('googleLogin', {
        failureRedirect: `${process.env.FRONTEND_DOMAIN}/?alert=Authentication Failed`,
        session: false
    }),
    authController.googleLogin
);

module.exports = router;
