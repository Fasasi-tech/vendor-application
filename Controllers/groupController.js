const asyncErrorHandler = require('../utils/asyncErrorHandler')
const customError = require('../utils/CustomError')
const {createSendResponse} = require('../utils/response')
const Permissions = require('../Models/permissionShema')
const Group = require('../Models/groupSchema')
const CustomError = require('../utils/CustomError')


exports.group = asyncErrorHandler(async (req, res, next) =>{
const getGroup=await Group.find({}).populate('permission')

 createSendResponse(getGroup, 200, res)
})

exports.singleGroup = asyncErrorHandler(async (req, res, next) =>{
  const singleGroup = await Group.findById(req.params.id)
  createSendResponse(singleGroup, 200, res)
})
exports.createGroup = asyncErrorHandler(async (req, res, next) =>{

    const {name, permission } = req.body
   
    const checkName= await Group.findOne({name})

    if (checkName){
        return next(new customError('Group name already exists', 400))
    }

   

    const createPermission= await Permissions.find({_id:{$in:permission}})
 
    console.log(createPermission, 'group')
    if (createPermission.length !== permission.length){
      return next(new customError('Some permissions are invalid', 400))
    }

    const data ={
      name
    }

    data.permission= permission
  

    const group = await Group.create(data)

    createSendResponse(group, 201, res)
})

 exports.editGoup = asyncErrorHandler(async (req, res, next) =>{

   const {name, permission} =req.body

  const group = await Group.findById(req.params.id)

  if (!group){

    return next(new CustomError('group not found', 404))
  }

  

  let updatedPermission = group.permission || []

  if (permission){
    updatedPermission = [...new Set([...updatedPermission, ...permission])]
  }

  console.log(updatedPermission, 'updateds')



  const findPermission = await Permissions.find({_id:{$in:permission}})

if (permission){
  if (findPermission.length !== permission.length){
    return next(new CustomError ('some permissions are invalid', 400))
  }
}

const data={
  name,
  permission:updatedPermission
 }
   const editGroup=await Group.findByIdAndUpdate(req.params.id, data, 
    { new: true, runValidators: true } )

    createSendResponse(editGroup, 200, res)
 })

 exports.deleteGroup = asyncErrorHandler(async (req, res, next) =>{

    const deletedGroup = await Group.findByIdAndDelete(req.params.id)

    if (!deletedGroup){
        return next(new CustomError ('Group not found', 404))
    }

    createSendResponse(null, 204, res)
 })