const express = require('express');
const authController = require('../../controllers/authController');
const passportSTA = require('../../controllers/googleAuthControllers/googleAuthControllerSTA');

const router = express.Router();
router.use(passportSTA.initialize());
router.get(
    '/',
    passportSTA.authenticate('google', {
        session: false,
        scope: ['profile', 'email']
    })
);
router.get(
    '/callback',
    passportSTA.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_DOMAIN}/?alert=authenticationFailed`,
        session: false
    }),
    authController.googleGetShortTimeAccessToken
);

module.exports = router;
