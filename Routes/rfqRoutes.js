const express = require('express')
const router= express.Router()

const RfqController = require('./../Controllers/rfqController')
const authController = require('./../Controllers/authController')


router.route('/').get(authController.protect, authController.restrict('superAdmin', 'admin', 'R.O.A', 'vendor'), RfqController.getRfq)


router.route('/create').post(authController.protect, authController.restrict('superAdmin', 'admin', 'user'), RfqController.createRfq)

router.route('/rfq/:id').patch(authController.protect, authController.restrict('vendor'), RfqController.editRfq)
                        .get(authController.protect, authController.restrict('vendor'), RfqController.getSingleRfq)


module.exports=router


