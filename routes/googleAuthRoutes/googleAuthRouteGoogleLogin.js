const express = require('express');
const authController = require('../../controllers/authController');
const passportGoogleLogin = require('../../controllers/googleAuthControllers/googleAuthControllerGL');

const router = express.Router();
router.use(passportGoogleLogin.initialize());
router.get(
    '/',
    passportGoogleLogin.authenticate('google', {
        session: false,
        scope: ['profile', 'email']
    })
);
router.get(
    '/callback',
    passportGoogleLogin.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_DOMAIN}/?alert=authenticationFailed`,
        session: false
    }),
    authController.googleLogin
);

module.exports = router;
