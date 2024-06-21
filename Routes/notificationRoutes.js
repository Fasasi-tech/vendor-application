const express = require('express');
const authController = require('./../Controllers/authController')
const router = express.Router()
const notificationController = require('../Controllers/notificationController')

router.route('/' ).get(authController.protect, authController.restrict('admin', 'superAdmin', 'R.O.A'), notificationController.getAllNotifications)


module.exports = router