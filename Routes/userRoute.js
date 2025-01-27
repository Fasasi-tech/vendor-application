const express = require('express');

const router = express.Router()
const userController = require('./../Controllers/userControllers')
const authController = require('./../Controllers/authController')


router.route('/password').patch(authController.protect, authController.verifyUserStatus, userController.updatePassword)

router.route('/stat').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'Stat'), userController.userAggregate )

router.route('/analytics').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'Analytics'), userController.createdUserAggregate )


router.route('/join').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'Join'), userController.leftJoin )

router.route('/me').patch( authController.protect,authController.verifyUserStatus, userController.updateMe)

router.route('/profile').get(authController.protect, authController.verifyUserStatus, userController.getUserProfile)

router.route('/delete/:id').delete(authController.protect, authController.verifyUserStatus, authController.checkPermission('Delete', 'Deactivate'), userController.deleteMe)

router.route('/').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'Users'), userController.getAllUsers)

router.route('/logout').post(authController.logout)

router.route('/message').post(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'BulkMessage'), userController.bulkMessaging)

router.route('/export').get(authController.protect, authController.verifyUserStatus, userController.exportUsersToExcel)

router.route('/aggregate').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read','Stat'), userController.getFiveUsers)

router.route('/:id').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'Users'),userController.getSingleUser)
                    .patch(authController.protect, authController.verifyUserStatus, authController.checkPermission('Edit', 'Users'), userController.editUsers)

router.route('/reactivate/:id').patch(authController.protect, authController.verifyUserStatus, authController.checkPermission('Activate','Users'), userController.reactivateUser)



module.exports= router; 