const express = require('express')
const router =express.Router()
const authController = require('./../Controllers/authController')
const productController = require('./../Controllers/productController')
const productLogController = require('./../Controllers/productLogController')

router.route('/log').get(authController.protect, authController.verifyUserStatus, authController.restrict('admin', 'R.O.A', 'superAdmin', 'user'), productLogController.getAllProductHistory)

router.route('/:id').get(authController.protect, authController.verifyUserStatus, authController.restrict('admin', 'R.O.A', 'superAdmin', 'user'), productLogController.getProductHistoryById)

 module.exports = router
