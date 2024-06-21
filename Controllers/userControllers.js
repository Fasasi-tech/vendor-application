const CustomError = require('../utils/CustomError');
const FilteringFeatures = require('../utils/filteringFeatures')
const User= require('./../Models/userModel');
const multer = require('multer')
const sharp = require('sharp')
const asyncErrorHandler = require('./../utils/asyncErrorHandler')
// const { createSendResponse } = require('./authController');
const jwt = require('jsonwebtoken')
const util = require('util')
const {sendEmail} = require('./../utils/email')
const crypto = require('crypto')
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const path = require('path');
const multerStorage = multer.memoryStorage()
const ExcelJS = require('exceljs');
const Notification = require('../Models/notificationModel');
const {createSendResponse} = require('../utils/response')


const filterReqObj = (obj, ...allowedFields) =>{
    const newObj ={}
    Object.keys(obj).forEach(prop => {
        if(allowedFields.includes(prop))
            newObj[prop] = obj[prop]
    })

    return newObj

}


exports.getAllUsers= asyncErrorHandler(async (req, res, next) => {
    const features = new FilteringFeatures(User.find({}), req.query).filter().sort().paginate().limitFields()
    const getUsers=await features.query
    

    createSendResponse(getUsers, 200, res)
    

})

exports.editUsers = asyncErrorHandler(async (req, res, next) =>{
    // const filterObj = filterReqObj(req.body, 'roles')
    const editUser = await User.findById(req.params.id)
    if(!editUser){
        const error = new CustomError('User with this ID is not found', 404)
        return next(error)
    }
    //const editUsers= await User.findByIdAndUpdate(req.params.id, filterObj, {runValidators:true, new:true} )
if(editUser){
    editUser.role=req.body.role || editUser.role
}

const editSuccess= await editUser.save()

const notification=await Notification.create({
    title:"User Notification",
    user:req.user._id,
    message:`${req.user.email} has updated a user's role`

})

const io = req.app.get('io');
io.emit('new-notification', notification);

    createSendResponse(editSuccess, 200, res)
})

exports.getSingleUser =asyncErrorHandler(async (req, res, next) => {
    const getUser = await User.findById(req.params.id)
    if(!getUser){
        const error = new CustomError('User with this ID is not found', 404)
        return next(error)
    }
    createSendResponse(getUser, 200, res)
})

exports.bulkMessaging = asyncErrorHandler(async (req, res, next) => {
    const {messages, receipients, subjects, attach} = req.body

    if (!Array.isArray(receipients)) {
        return next(new CustomError('Recipients must be provided as an array.'));
    }

    console.log(receipients)
    for (const receipient of receipients){
        const receipientId = receipient.id
        
        
        // const user = await User.findById(receipientId);
        const Users = await User.find({})
      
        const user =  Users.find((SingleUser) => SingleUser.id ===receipientId)
     
        if (!user){
            return next(new CustomError('User not found!')); 

           continue
        }

        const sent_to = user.email
        const sent_from = process.env.EMAIL_USER
        const reply_to = user.email
        const subject = subjects
        const message = messages// Attach PDF data
        const attachments = []

        if (attach){
            attachments.push({
                filename: 'Event.png',
                content: new Buffer.from(attach.split("base64,")[1], "base64"),
            })
        }
        //  attachments= [
        //     {
        //         filename: 'Event.png',
        //         content: attach,
        //         encoding: 'base64',
        //     },
        // ],
      
            await sendEmail(subject, message, sent_to, sent_from, reply_to, attachments);
    }
    res.status(200).json({
               status:'success',
                message:'Emails sent successfully'
            })

})

exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
    //GET CURRENT USER DATA FROM DATABASE
    const user = await User.findById(req.user._id).select('+password')
    //CHECK IF THE SUPPLIED CURRENT PASSWORD IS CORRECT
        if(! (await user.comparePasswordInDb(req.body.currentPassword, user.password))){
            return next(new CustomError('The current password you provided is wrong', 401))
        }

         // Check if the new password is the same as the current password
    if (req.body.password === req.body.currentPassword) {
        return next(new CustomError('Your new password cannot be the same as your current password', 400));
    }
    //IF THE SUPPLIED PASSWORD IS CORRECT, UPDATE THE USER PASSWORD WITH NEW VALUE
        user.password = req.body.password
        await user.save()

      const notification=  await Notification.create({
            title:"Password Update",
            user:req.user._id,
            message:`${vendor.name} has updated their password`
    
        })

        const io = req.app.get('io');
        io.emit('new-notification', notification);


        
    //LOGIN THE USER AND SEND JWT
    createSendResponse(user, 200, res)
    
})

exports.getUserProfile= asyncErrorHandler(async (req, res, next) =>{
    const user = await User.findById(req.user._id)

    if(!user){
        return next(new CustomError('User not found!'))
    }

   createSendResponse(user, 200, res)
})



exports.updateMe = asyncErrorHandler(async (req, res, next) =>{
    //check if request data contains password
    console.log(req.body)
   if (req.body.password){
    return next(new CustomError('You cannot update your password using this endpoint', 400))
   } 

   // update user detail
   const filterObj = filterReqObj(req.body, 'first_name','last_name', 'email', )

   // Find the current user
   const user = await User.findById(req.user._id);

    if (req.body.image) {
        // Check if user has an existing image and delete it from Cloudinary
        if (user.image && user.image.public_id) {
            await cloudinary.uploader.destroy(user.image.public_id);
        }

        // Upload new image to Cloudinary
        const result = await cloudinary.uploader.upload(req.body.image, {
            folder: "users",
            width: 300,
            crop: "scale"
        });

     // Add Cloudinary details to filterObj
     filterObj.image = {
        public_id: result.public_id,
        url: result.secure_url
    };
   }
  const Updateduser= await User.findByIdAndUpdate(req.user._id, filterObj, {runValidators:true, new:true} )

  const notification= await Notification.create({
    title:"Profile Notification",
    user:req.user._id,
    message:`${req.user.email} has updated their profile`

})

const io = req.app.get('io');
io.emit('new-notification', notification);


  createSendResponse(Updateduser,200, res)

})

exports.deleteMe = asyncErrorHandler(async (req, res, next) => {
    const deleteUser=await User.findByIdAndUpdate(req.params.id, {active:false})

    if (deleteUser.email ==='rfasasi@reeltechsolutions.com'){
        return next(CustomError("cannot delete this user", 400 ))
    }

   const notification= await Notification.create({
        title:"Deactivate Account",
        user:req.user._id,
        message:`${req.user.email} has deactivated an account`
    
    })


    const io = req.app.get('io');
    io.emit('new-notification', notification); 

    res.status(204).json({
        status: 'success',
        message: 'Your account has been deactivated. You can no longer log in.',
        data: null
    });
    
})

exports.reactivateUser = asyncErrorHandler(async (req, res, next) =>{
    
    const user = await User.findById(req.params.id);
    if (!user || user.active) {
      return next(new CustomError('User not found or already active', 404));
    }
    const activatedUser = await User.findByIdAndUpdate(req.params.id, {active:true}, {new:true} )

    const notification=await Notification.create({
        title:"Reactivate Account",
        user:req.user._id,
        message:`${req.user.email} has reactivated an account`
    
    })

    const io = req.app.get('io');
    io.emit('new-notification', notification);

    res.status(200).json({
        status: 'success',
        message: 'Your account has been reactivated. You can now log in.',
        data: activatedUser
    });
})

exports.userAggregate = asyncErrorHandler(async (req, res, next) =>{
 
    const user = await User.aggregate([
        {
            $group:{
                _id:"$role",
                count:{$sum:1}
            }
        }])

        createSendResponse(user, 200, res)

})

exports.getUsersAggregate = asyncErrorHandler(async (req, res, next) =>{
    const user = await User.aggregate([{
        $match :{active: {$ne: false}},

    },
    {
        $group:{
            _id:'$role'
        }
    }


    ])
})

exports.createdUserAggregate = asyncErrorHandler(async (req, res, next) => {
    const user = await User.aggregate([
        {
            $match: { createdAt: { $ne: null } } // Filter out documents where createdAt is null
        },
        {
            $addFields: {
                month: { $month: "$createdAt" }, // Extract month from createdAt field
                year: { $year: "$createdAt" } // Extract year from createdAt field
            }
        },
        {
            $group: {
                _id: { month: "$month", year: "$year" }, // Group by month and year
                count: { $sum: 1 }
            }
        }
    ]);

    createSendResponse(user, 200, res);
});


exports.exportUsersToExcel = asyncErrorHandler( async (req, res, next)=>{

    const allUsers = await User.find();

     // Create a new Excel workbook and worksheet
     const workbook = new ExcelJS.Workbook();
     const worksheet = workbook.addWorksheet('Users');

     worksheet.columns = [ 
        { header: "First Name", key: "fname", width: 15 }, 
        { header: "Last Name", key: "lname", width: 15 }, 
        { header: "createdAt", key: "createdAt", width: 25 }, 
        { header: "email", key: "email", width: 25 }, 
        { header: "role", key: "role", width: 25 },
        { header: "active", key: "active", width: 25 }, 
        ];
        


    allUsers.forEach(user => {
        worksheet.addRow([user.firstName , user.lastName, user.createdAt, user.email, user.role, user.active  ])
    })

      // Set response headers for Excel file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');

      // Send the Excel file as a response
      await workbook.xlsx.write(res);

      // End the response
      res.end();

     
})