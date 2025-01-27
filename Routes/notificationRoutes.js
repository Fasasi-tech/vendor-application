const express = require('express');
const authController = require('./../Controllers/authController')
const router = express.Router()
const notificationController = require('../Controllers/notificationController')

router.route('/' ).get(authController.protect, authController.verifyUserStatus,  authController.checkPermission('Read', 'Notifications'), notificationController.getAllNotifications)

router.route('/stats').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'NotificationStat'), notificationController.topFiveNotifications )


module.exports = router