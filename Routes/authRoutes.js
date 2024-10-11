const express = require('express');
const authController = require('./../Controllers/authController')
const router = express.Router()

router.route('/admin').post(authController.createSuperAdmin.seedAdminUser)

router.route('/login').post(authController.login)

router.route('/').post(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin', 'admin'), authController.addNewUser )

router.route('/forgotPassword').post(authController.forgotPassword)

router.route('/resetPassword/:token').patch(authController.resetPassword)
//router.route('/updatePassword').patch(authController.protect, authController.updatePassword)
// router.route('/AllUsers/:userId/role').put(authController.protect, authController.restrict('superadmin', 'admin'), authController.editUserRoles)
module.exports = router; 