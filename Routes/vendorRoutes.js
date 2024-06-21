const express = require('express');
const router = express.Router()
const vendorController = require('../Controllers/vendorController')
const authController = require('../Controllers/authController')
const vendorLogController = require('../Controllers/vendorLogController')


router.route('/').post(authController.protect, authController.restrict('vendor'), vendorController.createVendor )
                 .get(authController.protect, authController.restrict('superAdmin', 'admin', 'R.O.A'), vendorController.getAllVendors)
                 .patch(authController.protect, authController.restrict('vendor'), vendorController.getVendorSelfAndPatch)
                

router.route('/history').get(authController.protect, authController.restrict('admin', 'superAdmin', 'user', 'R.O.A'), vendorLogController.getAllVendorHistory)

router.route('/self').get(authController.protect, authController.restrict('vendor'), vendorController.getVendorSelf)

router.route('/:id').get(authController.protect, vendorController.getSingleVendor)
                    .patch(authController.protect, authController.restrict('superAdmin', 'admin' ), vendorController.getVendorAndUpdate)
                    .delete(authController.protect, authController.restrict('superAdmin', 'admin'), vendorController.deleteVendor)
                    


module.exports= router; 