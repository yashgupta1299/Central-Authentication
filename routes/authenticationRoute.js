const express = require('express');
// const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);
router.post('/signup', authController.isEmailVerified, authController.signup);

//! note write login again in frontend
// router.patch('/updateMyPassword', authController.updateMyPassword);

module.exports = router;
