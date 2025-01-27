const asyncErrorHandler = require('../utils/asyncErrorHandler');
const CustomError = require('../utils/CustomError');
const { createSendResponse } = require('../utils/response');
const Permission = require('./../Models/permissionShema')

exports.createPermissions = asyncErrorHandler(async (req, res, next) =>{

    const {name, contentType, codename} = req.body;

     const existingPermissions = await Permission.findOne({name})

     if (existingPermissions){
         
        const permissionError = new CustomError('permission already exists', 400)

        return next(permissionError)
     }

     const createPermission = await Permission.create({name, contentType, codename})

     createSendResponse(createPermission, 201, res)
})

exports.editPermission = asyncErrorHandler(async (req, res, next) =>{

    const {name, contentType, codename} = req.body
    const data={
        name,
        contentType,
        codename
    }
    const editPermission= await Permission.findByIdAndUpdate(
        req.params.id, data, 
        { new: true, runValidators: true }
    )
 console.log(editPermission, 'edit')
    createSendResponse(editPermission, 200, res)

})

exports.deletePermission = asyncErrorHandler(async (req, res, next) =>{

    await Permission.findByIdAndDelete(req.params.id)

    createSendResponse(null, 204, res)
})

exports.getPermission = asyncErrorHandler(async (req, res, next) =>{
    const permission = await Permission.find()

    createSendResponse(permission, 200, res)
})

