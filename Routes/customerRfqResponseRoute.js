const express = require('express')
const router = express.Router()
const authController = require('./../Controllers/authController')
const customerResponseController = require('./../Controllers/customerResponseController')

router.route('/').post(authController.protect, authController.verifyUserStatus, authController.checkPermission('Create', 'Vendor_RFQ'), customerResponseController.rfqResponse)

router.route('/').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('GET', 'Vendor_RFQ'), customerResponseController.getMyRfqResponse)

router.route('/vendor/response').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('GET', 'Vendor_RFQ'), customerResponseController.filterResponseBasedOnVendor)

router.route('/responses').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('GET', 'Vendor_RFQ'), customerResponseController.allResponses )

router.route('/aggregate').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('GET', 'aggregate'), customerResponseController.RfqResponseAggregate)

router.route('/responses/:id').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('GET', 'Vendor_RFQ'), customerResponseController.singleRfqResponses)

module.exports = router;