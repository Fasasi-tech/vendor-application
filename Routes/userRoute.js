const express = require('express');

const router = express.Router()
const userController = require('./../Controllers/userControllers')
const authController = require('./../Controllers/authController')


router.route('/password').patch(authController.protect, authController.verifyUserStatus, userController.updatePassword)

router.route('/stat').get(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin', 'admin', 'R.O.A'), userController.userAggregate )

router.route('/analytics').get(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin', 'admin', 'R.O.A'), userController.createdUserAggregate )


router.route('/join').get(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin', 'admin', 'R.O.A'), userController.leftJoin )

router.route('/me').patch( authController.protect,authController.verifyUserStatus, userController.updateMe)

router.route('/profile').get(authController.protect, authController.verifyUserStatus, userController.getUserProfile)

router.route('/delete/:id').delete(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin', 'admin'), userController.deleteMe)

router.route('/').get(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin','admin', 'R.O.A'),userController.getAllUsers)

router.route('/logout').post(authController.logout)

router.route('/message').post(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin','admin', 'R.O.A'), userController.bulkMessaging)

router.route('/export').get(authController.protect, authController.verifyUserStatus, userController.exportUsersToExcel)

router.route('/aggregate').get(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin', 'admin', 'R.O.A'), userController.getFiveUsers)

router.route('/:id').get(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin','admin', 'R.O.A'),userController.getSingleUser)
                    .patch(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin', 'admin'), userController.editUsers)

router.route('/reactivate/:id').patch(authController.protect, authController.verifyUserStatus, authController.restrict('superAdmin','admin'), userController.reactivateUser)



module.exports= router; 