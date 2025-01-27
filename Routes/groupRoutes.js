const express = require('express')
const router= express.Router()
const GroupController= require('../Controllers/groupController')
const authController = require('../Controllers/authController')

router.route('/').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'Group'), GroupController.group)

router.route('/').post(authController.protect, authController.verifyUserStatus, authController.checkPermission('Create', 'Group'), GroupController.createGroup)

router.route('/:id').patch(authController.protect, authController.verifyUserStatus, authController.checkPermission('Edit', 'Group'), GroupController.editGoup)

router.route('/:id').get(authController.protect, authController.verifyUserStatus, authController.checkPermission('Read', 'Group'), GroupController.singleGroup)

router.route('/:id').delete(authController.protect, authController.verifyUserStatus, authController.checkPermission('Delete', 'Group'), GroupController.deleteGroup)
module.exports= router