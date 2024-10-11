const express = require('express');
const router = express.Router()
const vendorController = require('../Controllers/vendorController')
const authController = require('../Controllers/authController')
const vendorLogController = require('../Controllers/vendorLogController')

router.route('/').get(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin', 'admin', 'R.O.A', 'user'), vendorController.getAllVendors)
router.route('/').post(authController.protect, authController.verifyUserStatus, authController.restrict('vendor'), vendorController.createVendor )
                 .patch(authController.protect, authController.verifyUserStatus, authController.restrict('vendor'), vendorController.getVendorSelfAndPatch)
                

router.route('/history').get(authController.protect, authController.verifyUserStatus, authController.restrict('admin', 'superAdmin', 'user', 'R.O.A'), vendorLogController.getAllVendorHistory)


router.route('/self').get(authController.protect, authController.verifyUserStatus, authController.restrict('vendor'), vendorController.getVendorSelf)


router.route('/history/:id').get(authController.protect, authController.verifyUserStatus, authController.restrict('admin', 'superAdmin', 'user', 'R.O.A'), vendorLogController.getvendorHistoryById)

router.route('/:id').get(authController.protect, authController.verifyUserStatus, vendorController.getSingleVendor)
                    .patch(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin', 'admin' ), vendorController.getVendorAndUpdate)
                    .delete(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin', 'admin'), vendorController.deleteVendor)
                    


module.exports= router; 