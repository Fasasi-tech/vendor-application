const express = require('express');
const authController = require('./../Controllers/authController')
const router = express.Router()
const notificationController = require('../Controllers/notificationController')

router.route('/' ).get(authController.protect, authController.verifyUserStatus,  authController.restrict('admin', 'superAdmin', 'R.O.A', 'user'), notificationController.getAllNotifications)
router.route('/stats').get(authController.protect, authController.verifyUserStatus, authController.restrict('admin','superAdmin', 'R.O.A', 'user'), notificationController.topFiveNotifications )


module.exports = router