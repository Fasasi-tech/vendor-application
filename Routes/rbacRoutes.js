const express = require('express')
const PermissionController = require('./../Controllers/permissionController')
const router = express.Router()
const authController = require('./../Controllers/authController')

router.route('/').post(authController.protect, authController.verifyUserStatus, PermissionController.createPermissions)
router.route('/').get(authController.protect, authController.verifyUserStatus, PermissionController.getPermission)
router.route('/:id').patch(authController.protect, authController.verifyUserStatus, PermissionController.editPermission)
router.route('/:id').delete(authController.protect, authController.verifyUserStatus, PermissionController.deletePermission)

module.exports = router
