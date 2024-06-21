const express = require('express');

const router = express.Router()
const userController = require('./../Controllers/userControllers')
const authController = require('./../Controllers/authController')


router.route('/password').patch(authController.protect, userController.updatePassword)

router.route('/stat').get(authController.protect, authController.restrict('superAdmin', 'admin', 'R.O.A'), userController.userAggregate )

router.route('/analytics').get(authController.protect, authController.restrict('superAdmin', 'admin', 'R.O.A'), userController.createdUserAggregate )

router.route('/me').patch( authController.protect, userController.updateMe)

router.route('/profile').get(authController.protect, userController.getUserProfile)

router.route('/delete/:id').delete(authController.protect, authController.restrict('superAdmin', 'admin'), userController.deleteMe)

router.route('/').get(authController.protect,authController.restrict('superAdmin','admin', 'R.O.A'),userController.getAllUsers)

router.route('/logout').post(authController.logout)

router.route('/message').post(authController.protect, userController.bulkMessaging)


router.route('/:id').get(authController.protect,authController.restrict('superAdmin','admin', 'R.O.A'),userController.getSingleUser)
                    .patch(authController.protect, authController.restrict('superAdmin', 'admin'), userController.editUsers)



router.route('/reactivate/:id').patch(authController.protect, authController.restrict('superAdmin','admnin'), userController.reactivateUser)



module.exports= router; 