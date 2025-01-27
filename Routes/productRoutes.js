const express = require('express')
const router =express.Router()
const userController = require('./../Controllers/userControllers')
const authController = require('./../Controllers/authController')
const productController = require('./../Controllers/productController')
const ReviewController= require('./../Controllers/reviewController')
const reviewRoute= require('./reviewRoutes')
// const rfqRoute = require('./rfqRoutes')

router.use ('/:id/reviews', reviewRoute )
// router.use('/:id/rfq', rfqRoute )

router.route('/').get(authController.protect,  productController.getAllProducts)
                 .post(authController.protect,   productController.createProduct)

router.route('/vendor-product').get(authController.protect,  productController.getVendorProducts)


router.route('/Deleted-Products').get(authController.protect, productController.getDeletedProduct)

router.route('/category').get(authController.protect,  productController.categoryAggregate)

router.route('/:id').patch(authController.protect,  productController.editSingleProduct)
                    .get(authController.protect, productController.getSingleProduct)
                    .delete(authController.protect, productController.deleteProduct )

router.route('/vendor-product/:id').get(authController.protect,  productController.getProductsBasedOnVendorId)

router.route('/vendorEmail/:id').post(authController.protect,  productController.sendRequestForQuotation )


module.exports= router; 