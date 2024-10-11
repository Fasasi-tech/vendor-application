const express = require('express')
const router= express.Router({mergeParams:true})
const reviewController = require('./../Controllers/reviewController')
const authController = require('./../Controllers/authController')

router.route('/').get(reviewController.getReview).post(authController.protect, authController.verifyUserStatus, authController.restrict('user', 'admin', 'superAdmin'), reviewController.createReview )
router.route('/:id').get(authController.protect, authController.verifyUserStatus, reviewController.getReviewBasedOnId)
module.exports= router; 