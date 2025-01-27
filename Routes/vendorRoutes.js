const express = require('express');
const router = express.Router()
const vendorController = require('../Controllers/vendorController')
const authController = require('../Controllers/authController')
const vendorLogController = require('../Controllers/vendorLogController')

router.route('/').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'Vendors'), vendorController.getAllVendors)
router.route('/').post(authController.protect, authController.verifyUserStatus, authController.checkPermission('Create', 'Vendor'), vendorController.createVendor )
                 .patch(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'Vendor'), vendorController.getVendorSelfAndPatch)
                

router.route('/history').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'Vendor-History'), vendorLogController.getAllVendorHistory)


router.route('/self').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'Vendor'), vendorController.getVendorSelf)


router.route('/history/:id').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'Vendor-History'), vendorLogController.getvendorHistoryById)

router.route('/:id').get(authController.protect, authController.verifyUserStatus, vendorController.getSingleVendor)
                    .patch(authController.protect, authController.verifyUserStatus, authController.checkPermission('Edit', 'Vendor'), vendorController.getVendorAndUpdate)
                    .delete(authController.protect, authController.verifyUserStatus, authController.checkPermission('Delete', 'Vendor'), vendorController.deleteVendor)
                    


module.exports= router; 