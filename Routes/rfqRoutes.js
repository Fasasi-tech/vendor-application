const express = require('express')
const router= express.Router({mergeParams:true})

const RfqController = require('./../Controllers/rfqController')
const authController = require('./../Controllers/authController')


router.route('/').get(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin', 'admin', 'R.O.A', 'vendor', 'user'), RfqController.getRfq)


router.route('/').post(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin', 'admin', 'user', 'R.O.A'), RfqController.createRfq)

router.route('/response').post(authController.protect, authController.verifyUserStatus, authController.restrict('vendor'), RfqController.createRfqResponse)

router.route('/response').get(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin','admin', 'user'), RfqController.RfqResponses)

router.route('/response/:id').get(authController.protect, authController.restrict('superAdmin', 'admin', 'user'), RfqController.getSingleRfqResponse)

router.route('/:id').patch(authController.protect, authController.verifyUserStatus, authController.restrict('vendor'), RfqController.editRfq)
                        .get(authController.protect, authController.verifyUserStatus, authController.restrict('vendor', 'admin', 'user', 'R.O.A', 'superAdmin'), RfqController.getSingleRfq)


module.exports=router


