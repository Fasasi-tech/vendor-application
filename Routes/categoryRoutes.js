
const express = require('express')
const categoryController = require('./../Controllers/categoryController')
const authController = require('./../Controllers/authController')
const router = express.Router()

router.route('/').post(authController.protect, authController.verifyUserStatus, authController.checkPermission('Create', 'Category'), categoryController.category )
router.route('/').get(authController.protect, authController.verifyUserStatus, authController.checkPermission("Read", "Category"), categoryController.getCategories )
router.route('/aggregate').get(authController.protect, authController.verifyUserStatus, authController.checkPermission("Read", "Category"), categoryController.categoryAggregate)
router.route('/:id').get(authController.protect, authController.verifyUserStatus, authController.checkPermission("Read", "Category"), categoryController.getSingleCategory)
router.route('/:id').patch(authController.protect, authController.verifyUserStatus, authController.checkPermission("Edit", "Category"), categoryController.getSingleCategoryAndUpdate)
module.exports = router