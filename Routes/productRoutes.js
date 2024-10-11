const express = require('express')
const router =express.Router()
const userController = require('./../Controllers/userControllers')
const authController = require('./../Controllers/authController')
const productController = require('./../Controllers/productController')
const ReviewController= require('./../Controllers/reviewController')
const reviewRoute= require('./reviewRoutes')
const rfqRoute = require('./rfqRoutes')

router.use ('/:id/reviews', reviewRoute )
router.use('/:id/rfq', rfqRoute )

router.route('/').get(authController.protect, authController.restrict('admin', 'superAdmin', 'user', 'R.O.A'), productController.getAllProducts)
                 .post(authController.protect, authController.restrict('vendor'),  productController.createProduct)

router.route('/vendor-product').get(authController.protect, authController.restrict('vendor'), productController.getVendorProducts)


router.route('/Deleted-Products').get(authController.protect, productController.getDeletedProduct)

router.route('/category').get(authController.protect, authController.restrict('admin', 'superAdmin', 'user','R.O.A'), productController.categoryAggregate)

router.route('/:id').patch(authController.protect, authController.restrict('vendor'), productController.editSingleProduct)
                    .get(authController.protect, productController.getSingleProduct)
                    .delete(authController.protect, authController.restrict('vendor'), productController.deleteProduct )

router.route('/vendor-product/:id').get(authController.protect, authController.restrict('admin', 'superAdmin', 'user', 'vendor'), productController.getProductsBasedOnVendorId)

router.route('/vendorEmail/:id').post(authController.protect, authController.restrict('user', 'admin', 'superAdmin'), productController.sendRequestForQuotation )

// router.route('/:id/reviews').post(authController.protect, productController.comment )
//                             .get(authController.protect, productController.getProductWithReviews);

// router.route('/:id/reviews').post(authController.protect, authController.restrict('user', 'admin', 'superAdmin'), ReviewController.createReview)

module.exports= router; 