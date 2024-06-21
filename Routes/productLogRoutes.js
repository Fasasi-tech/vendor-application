const express = require('express')
const router =express.Router()
const authController = require('./../Controllers/authController')
const productController = require('./../Controllers/productController')
const productLogController = require('./../Controllers/productLogController')

router.route('/getProductLog').get(authController.protect, authController.restrict('admin', 'R.O.A', 'superAdmin', 'user'), productLogController.getAllProductHistory)

router.route('/getProductById/:id').get(authController.protect, authController.restrict('admin', 'R.O.A', 'superAdmin', 'user'), productLogController.getProductHistoryById)

 module.exports = router
