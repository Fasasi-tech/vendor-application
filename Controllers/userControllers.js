const CustomError = require('../utils/CustomError');
const FilteringFeatures = require('../utils/filteringFeatures')
const User= require('./../Models/userModel');
const asyncErrorHandler = require('./../utils/asyncErrorHandler')
const {sendEmail} = require('./../utils/email')
const ExcelJS = require('exceljs');
const Notification = require('../Models/notificationModel');
const {createSendResponse} = require('../utils/response')
const cloudinary = require('../utils/cloudinary');
const Group = require('./../Models/groupSchema')

const filterReqObj = (obj, ...allowedFields) =>{
    const newObj ={}
    Object.keys(obj).forEach(prop => {
        if(allowedFields.includes(prop))
            newObj[prop] = obj[prop]
    })

    return newObj

}


exports.getAllUsers= asyncErrorHandler(async (req, res, next) => {
    const features = new FilteringFeatures(User.find({}).populate({path:'group',populate:{path:'permission'}}), req.query).search().sort().paginate().limitFields()
    const getUsers=await features.query
    const count = await User.find({})
    const result= count.length 

    createSendResponse({getUsers, result}, 200, res)
    

})

exports.getFiveUsers= asyncErrorHandler(async (req, res, next) =>{
    const getUsers= await User.find().populate('group').sort({ createdAt: -1 }).limit(5);

    createSendResponse(getUsers, 200, res)
})

exports.editUsers = asyncErrorHandler(async (req, res, next) =>{
    const editUser = await User.findById(req.params.id)
    if(!editUser){
        const error = new CustomError('User with this ID is not found', 404)
        return next(error)
    }
    if(editUser){
        editUser.group=req.body.group || editUser.group
        editUser.permissions=req.body.permissions || editUser.permissions
    }

const editSuccess= await editUser.save()

const notification=await Notification.create({
    title:"User ",
    user:req.user._id,
    message:`${req.user.email} has updated a user's role`

})

const io = req.app.get('io');
io.emit('new-notification', notification);

    createSendResponse(editSuccess, 200, res)
})

exports.getSingleUser =asyncErrorHandler(async (req, res, next) => {
    const getUser = await User.findById(req.params.id).populate({path:'group',populate:{path:'permission'}})
    if(!getUser){
        const error = new CustomError('User with this ID is not found', 404)
        return next(error)
    }
    createSendResponse(getUser, 200, res)
})


exports.bulkMessaging = asyncErrorHandler(async (req, res, next) => {
    const { messages, receipients, subjects, attachment } = req.body;

    if (!Array.isArray(receipients)) {
        return next(new CustomError('Recipients must be provided as an array.'));
    }

    for (const receipient of receipients) {
        const receipientId = receipient.id;
        const Users = await User.find({});
        const user = Users.find((SingleUser) => SingleUser.id === receipientId);

        if (!user) {
            return next(new CustomError('User not found!'));
        }

        const sent_to = user.email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = user.email;
        const subject = subjects;
        const message = messages;
        
        const emailAttachments = attachment ? [{
            filename: attachment.filename,
            content: new Buffer.from(attachment.content.split("base64,")[1], "base64"),
        }] : [];

        await sendEmail(subject, message, sent_to, sent_from, reply_to, emailAttachments);
    }

    res.status(200).json({
        status: 'success',
        message: 'Emails sent successfully',
    });
});


exports.updatePassword = asyncErrorHandler(async (req, res, next) => {

    if (req.body.password === req.body.currentPassword) {
        return next(new CustomError('Your new password cannot be the same as your current password', 400));
    }
    //GET CURRENT USER DATA FROM DATABASE
    const user = await User.findById(req.user._id).select('+password')
    //CHECK IF THE SUPPLIED CURRENT PASSWORD IS CORRECT
        if(! (await user.comparePasswordInDb(req.body.currentPassword, user.password))){
            return next(new CustomError('The current password you provided is wrong', 401))
        }

    //IF THE SUPPLIED PASSWORD IS CORRECT, UPDATE THE USER PASSWORD WITH NEW VALUE
        user.password = req.body.password
        await user.save()

      const notification=  await Notification.create({
            title:"Password Update",
            user:req.user._id,
            message:`${user.email} has updated their password`
    
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

    if (Object.keys(req.body).length === 0) {
        return next(new CustomError('No data provided for update', 400));
    }

   if (req.body.password){
    return next(new CustomError('You cannot update your password using this endpoint', 400))
   } 

   // update user detail
   const filterObj = filterReqObj(req.body, 'firstName','lastName', 'email' )

   // Find the current user
   const user = await User.findById(req.user._id);

   if(!user){
    return next(new CustomError('User not found!'))
}
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
    title:"Profile ",
    user:req.user._id,
    message:`${req.user.email} has updated their profile`

})

const io = req.app.get('io');
io.emit('new-notification', notification);


  createSendResponse(Updateduser,200, res)

})

exports.deleteMe = asyncErrorHandler(async (req, res, next) => {
    const deleteUser=await User.findByIdAndUpdate(req.params.id, {active:false })

    if (deleteUser.email ==='rfasasi@reeltechsolutions.com'){
        return next(CustomError("cannot delete this user", 400 ))
    }

    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    
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


    createSendResponse({user:activatedUser, message:'Your account has been reactivated. You can now log in.'}, 200, res)
})

exports.userAggregate = asyncErrorHandler(async (req, res, next) =>{
 
    const user = await Group.aggregate([
        {
            $group:{
                _id:"$name",
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

    // const {year} = req.query

    const d = new Date().toISOString();
    const convert = d.split('-')
    const date= convert[0]
    
    const user = await User.aggregate([
        {
            $match: { createdAt: { 
                $gte: new Date(`${date}-01-01`),
                $lte: new Date(`${date}-12-31`) } } // Filter out documents where createdAt is null
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
        },
        {
            $sort:{"_id.month":1}
        }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const months= Array.from({length:12}, (_,i) => i+1)

    const chartData = months.map((month)=>{
        const aggregateResult = user.find((d)=> d._id.month ===month)
        return aggregateResult ? aggregateResult.count :0;
    }

    )

    createSendResponse({labels:monthNames, data:chartData}, 200, res);
});


exports.exportUsersToExcel = asyncErrorHandler( async (req, res, next)=>{

    const allUsers = await User.find().populate('group', 'name');

     // Create a new Excel workbook and worksheet
     const workbook = new ExcelJS.Workbook();
     const worksheet = workbook.addWorksheet('Users');

     worksheet.columns = [ 
        { header: "email", key: "email", width: 25 }, 
        { header: "group", key: "group", width: 25 },
        { header: "active", key: "active", width: 25 }, 
        { header: "createdAt", key: "createdAt", width: 25 }, 
       
        ];
        


    allUsers.forEach(user => {
        worksheet.addRow([  user.email, user.group?.name, user.active, user.createdAt ])
    })

      // Set response headers for Excel file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');

      // Send the Excel file as a response
      await workbook.xlsx.write(res);

      // End the response
      res.end();

     
})

exports.leftJoin = asyncErrorHandler(async (req, res, next) =>{
    
    const { searchText, role } = req.query; // Optional filters

    // Define the aggregation pipeline
    const pipeline = [
        // Lookup vendors
        {
            $lookup: {
                from: 'vendors', // Vendors collection
                localField: '_id', // User ID
                foreignField: 'user', // User field in vendors
                as: 'vendorDetails',
            },
        },
        // Lookup customers
        {
            $lookup: {
                from: 'customers', // Customers collection
                localField: '_id', // User ID
                foreignField: 'user', // User field in customers
                as: 'customerDetails',
            },
        },
        // Add a unified role field
        {
            $addFields: {
                role: {
                    $cond: {
                        if: { $gt: [{ $size: '$vendorDetails' }, 0] },
                        then: 'Vendor',
                        else: {
                            $cond: {
                                if: { $gt: [{ $size: '$customerDetails' }, 0] },
                                then: 'Customer',
                                else: 'User',
                            },
                        },
                    },
                },
            },
        },
        // Add businessName for vendors or name for customers
        {
            $addFields: {
                businessName: { $arrayElemAt: ['$vendorDetails.businessName', 0] },
                customerName: {
                    $concat: [
                        { $arrayElemAt: ['$customerDetails.firstName', 0] },
                        ' ',
                        { $arrayElemAt: ['$customerDetails.lastName', 0] },
                    ],
                },
            },
        },
        // Optional: Search functionality
        ...(searchText
            ? [
                  {
                      $match: {
                          $or: [
                              { email: { $regex: searchText, $options: 'i' } },
                              { 'vendorDetails.businessName': { $regex: searchText, $options: 'i' } },
                              { 'customerDetails.firstName': { $regex: searchText, $options: 'i' } },
                              { 'customerDetails.lastName': { $regex: searchText, $options: 'i' } },
                          ],
                      },
                  },
              ]
            : []),
        // Optional: Role filter
        ...(role
            ? [
                  {
                      $match: { role }, // Match Vendor, Customer, or User
                  },
              ]
            : []),
        // Project only the necessary fields
        {
            $project: {
                email: 1,
                role: 1,
                businessName: 1,
                customerName: 1,
                'vendorDetails.phoneNumber': 1,
                'customerDetails.phoneNumber': 1,
            },
        },
    ];

    // Execute the aggregation pipeline
    const users = await User.aggregate(pipeline);

    // Send the response
    createSendResponse(users, 200, res);
})