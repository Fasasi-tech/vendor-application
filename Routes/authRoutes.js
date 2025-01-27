const express = require('express');
const authController = require('./../Controllers/authController')
const router = express.Router()

router.route('/admin').post(authController.createSuperAdmin.seedAdminUser)

router.route('/login').post(authController.login)

router.route('/').post(authController.protect, authController.verifyUserStatus, authController.checkPermission("Create", "Auth"), authController.addNewUser )

router.route('/forgotPassword').post(authController.forgotPassword)

router.route('/resetPassword/:token').patch(authController.resetPassword)

module.exports = router; 