const CustomError = require('../utils/CustomError');
const User= require('./../Models/userModel');
const asyncErrorHandler = require('./../utils/asyncErrorHandler')
const jwt = require('jsonwebtoken')
const util = require('util')
const crypto = require('crypto')
const {sendEmail} = require('../utils/email')
const {plainEmailTemplate, generatePasswordResetTemplate} = require('../utils/mail')
const cloudinary = require('../utils/cloudinary');
const Notification = require('../Models/notificationModel');
const {createSendResponse} = require('../utils/response')



exports.createSuperAdmin=  {
    seedAdminUser: asyncErrorHandler(async(req, res, next) =>{
    const existingsuperAdmin= await User.findOne({role:'superAdmin'})
    
    if (existingsuperAdmin){
        const error = new CustomError('superAdmin user already exists', 400)
        return next(error);
    }

    const newUser = new User({
        firstName:process.env.ADMIN_FIRSTNAME,
        lastName:process.env.ADMIN_LASTNAME,
        email:process.env.ADMIN_EMAIL,
        role:'superAdmin',
        password:process.env.ADMIN_PASSWORD,
        
    })

    if(req.body.image){
        const result = await cloudinary.uploader.upload(req.body.image, {
            folder: "profile",
            width: 300,
            crop: "scale"
        });

        newUser.image={
            public_id: result.public_id,
            url: result.secure_url
        }
    
    }


   
    await newUser.save()
    createSendResponse(newUser, 201, res)
    
 }) 
}

 

exports.login =asyncErrorHandler(async(req, res, next) =>{
    const {email, password} = req.body;

    if(!email || !password){
        const error = new CustomError('Please provide email ID & Password', 401)
        return next(error);
    }

    const user = await User.findOne({email}).select('+password')

    if (user.active === false){
        const error = new CustomError('User has been deactivated', 404)
        return next(error);
    }

    if(!user || !(await user.comparePasswordInDb(password, user.password))){
        const error = new CustomError('Incorrect email or password', 400)
        return next(error)
    }

     // Create custom response object
     const userResponse = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
        image:user.image
    };
    
    createSendResponse(userResponse , 200, res)

  
})

exports.logout = asyncErrorHandler(async(req, res, next) => {

    
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
      });

      res.status(200).json({
        status:'Logged out successfully',
      
    })

})

exports.protect = asyncErrorHandler(async (req, res, next) =>{
    //Read the token & check if the token actually exists 
    const testToken = req.headers.authorization;
    let token
    if(testToken && testToken.startsWith('Bearer')){
        token= testToken.split(' ')[1]
    }
    if(!token){
        next(new CustomError('You are not logged in', 401))
    }
    //validate the token
    const decodedToken=  await util.promisify(jwt.verify)(token, process.env.SECRET_STR)
    // if the user exists in the db

    const user = await User.findById(decodedToken.id) // getting the id of the user through the decodedToken
    if(!user){
        next(new CustomError('The user with the given token does not exist', 401))
    }

    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat)
    //if the user changed password after the token was issued, you would not be able to access the route.
    if(isPasswordChanged){
        const error = new CustomError('The password has been changed recently, please login again', 401)
        return next(error)
    }
    // allow user to access route
    req.user = user
    next()

})



exports.restrict = (...roles) =>{
    return (req, res, next) =>{
        if(!roles.includes(req.user.role)){
            const error = new CustomError('You do not have permission to perform this action', 403);
            next(error)
        }
        next()
    }
  
}


exports.addNewUser = asyncErrorHandler(async (req, res, next) =>{

    const {firstName, lastName, email, role, image} = req.body

    // Automatically set password as a concatenation of firstname and lastname
    const password =`${firstName}${lastName}`

    const signUser = {
        firstName,
        lastName,
        email,
        role,
        password
    }

    if (image){
        const result = await cloudinary.uploader.upload(image, {
            folder: "profile",
            width: 300,
            crop: "scale"
        });

        signUser.image={
            public_id: result.public_id,
            url: result.secure_url
        }
    }



   const createUser= await User.create(signUser)
   const url=`${req.protocol}://${req.get('host')}/me`
   console.log(url)
//    await new Email(createUser, url).sendWelcome()
const sent_to = createUser.email;
    const sent_from = process.env.EMAIL_OWNER;
    const reply_to = createUser.email;
    const subject = "WELCOME EMAIL";
    const message = plainEmailTemplate(
        "You are now registered",
    `Dear ${createUser.firstName}, Welcome to BNSL. We are glad to have you.`

    );
await sendEmail(subject, message, sent_to, sent_from, reply_to)

const notification=await Notification.create({
    title:"User Created",
    user:req.user._id,
    message:`${req.user._id} has created a user`

})

const io = req.app.get('io');

io.emit('new-notification', notification);

createSendResponse(createUser, 201, res)

 }) 

 exports.forgotPassword = asyncErrorHandler(async (req, res, next) =>{
    //Get user based on posted email
    const user = await User.findOne({email:req.body.email})
    if(!user){
        const error = new CustomError('We could not find the user with given email', 404)
        return next(error)
    }

    // Generate a random reset token if users exists
    const resetToken = user.createResetPasswordToken()

    await user.save({validateBeforeSave:false})

    // send the token back to the user email
    const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`
    // const message = `We have received a password reset request. Please use the below link to reset your password \n \n ${resetUrl} \n\n This reset password link will be valid on for 10 minutes.`
    const sent_to = user.email;
     const sent_from = process.env.EMAIL_USER;
    const reply_to = user.email;
    const subject = "PASSWORD RESET";
    const message = generatePasswordResetTemplate(resetUrl)

    await sendEmail(subject, message, sent_to, sent_from, reply_to)
    try{

    // await new Email(user,resetUrl).sendPasswordReset()
    res.status(200).json({
        status:'success',
        message:'Password reset link sent to the user'
    })
} catch(err){
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({validateBeforeSave:false})

    return next(new CustomError('There was an error sending password reset email. Please try again later', 500))
}
 })

 exports.resetPassword = asyncErrorHandler (async (req, res, next) =>{
    // IF THE USER EXISTS WITH THE GIVEN TOKEN AND TOKEN HAS NOT EXPIRED
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({passwordResetToken:token, passwordResetTokenExpires: {$gt:Date.now()}});
    if(!user){
        const error = new CustomError('Token is inValid or has expired', 400)
        next(error)
    }
    // RESETTING THE USER PASSWORD
    user.password = req.body.password
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now()

    user.save()

    const notification=await Notification.create({
        title:"Password reset",
        user:req.user._id,
        message:`${req.user._id} has reset their password`

    })
    const io = req.app.get('io');
    io.emit('new-notification', notification);
    createSendResponse(user, 200, res)


 })


