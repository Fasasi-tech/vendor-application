const express = require('express');
const router= express.Router();
const authController = require('./../Controllers/authController')
const customerController= require('./../Controllers/CustomerController')

router.route('/').post(authController.protect, authController.verifyUserStatus, authController.checkPermission('Create', 'Customer'), customerController.createCustomer  )

router.route('/').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'Customer'), customerController.getAllCustomer)

router.route('/self').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read_self', 'Customer'), customerController.getCustomerSelf)

router.route('/self').patch(authController.protect, authController.verifyUserStatus, authController.checkPermission('Customer_Edit', 'Customer'), customerController.updateCustomerSelf)

router.route('/:id').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read','Customer'), customerController.getCustomerById)

// router.route('/self/:id').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read_self', 'Customer'), customerController.getCustomerDetails)


router.route('/:id').patch(authController.protect, authController.verifyUserStatus, authController.checkPermission('Edit', 'Customer'), customerController.updateCustomerByAdmin)



module.exports= router