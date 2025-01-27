const express = require('express')
const authController = require('./../Controllers/authController')
const router = express.Router()
const customerRfqController = require('../Controllers/customerRfqController')

router.route('/').post(authController.protect, authController.verifyUserStatus, authController.checkPermission('Create', 'RFQ'), customerRfqController.createRfq)

router.route('/').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('GET', 'Vendor_RFQ'), customerRfqController.vendorsRfq)

router.route('/aggregate').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('GET', 'RFQ_Stat'), customerRfqController.RfqAggregate)

router.route('/rfqs').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('GET', 'RFQs'), customerRfqController.getAllRfq)



router.route('/:id').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('GET', 'Vendor_RFQ'), customerRfqController.singleRfq)

module.exports = router