const express = require('express')
const router =express.Router()
const userController = require('./../Controllers/userControllers')
const authController = require('./../Controllers/authController')
const productController = require('./../Controllers/productController')


router.route('/').get(authController.protect, authController.restrict('admin', 'superAdmin', 'user', 'R.O.A'), productController.getAllProducts)
                 .post(authController.protect, authController.restrict('vendor'),  productController.createProduct)

router.route('/vendor-product').get(authController.protect, authController.restrict('vendor'), productController.getVendorProducts)


router.route('/Deleted-Products').get(authController.protect, productController.getDeletedProduct)

router.route('/:id').patch(authController.protect, authController.restrict('vendor'), productController.editSingleProduct)
                    .get(authController.protect, productController.getSingleProduct)
                    .delete(authController.protect, authController.restrict('vendor'), productController.deleteProduct )

router.route('/vendorEmail/:id').post(authController.protect, authController.restrict('user', 'admin', 'superAdmin'), productController.sendRequestForQuotation )

router.route('/:id/reviews').post(authController.protect, productController.comment )
                            .get(authController.protect, productController.getProductWithReviews);

module.exports= router; 