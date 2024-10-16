const CustomError = require('../utils/CustomError');
const User= require('./../Models/userModel');
const asyncErrorHandler = require('./../utils/asyncErrorHandler')
const jwt = require('jsonwebtoken')
const {promisify} = require('util')
const crypto = require('crypto')
const {sendEmail} = require('../utils/email')
const {plainEmailTemplate, generatePasswordResetTemplate} = require('../utils/mail')
const cloudinary = require('../utils/cloudinary');
const Notification = require('../Models/notificationModel');
const {createSendResponse, createSendResponseAuth} = require('../utils/response')
const Blacklist = require('../Models/blacklistSchema')



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
    createSendResponseAuth(newUser, 201, res)
    
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
   
    
     createSendResponseAuth(user , 200, res)

  
})

exports.logout = asyncErrorHandler(async(req, res, next) => {

    const authHeader = req.headers['cookie']
    if (!authHeader){
        return  next(new CustomError('No content', 204))
    }

    const cookie = authHeader.split('=')[1]
    const accessToken = cookie.split(';')[0]
    const checkIfBlacklisted = await Blacklist.findOne({token: accessToken});

    if (checkIfBlacklisted){
        return res.status(204)
    }

    const newBlacklist = new Blacklist({
        token: accessToken,
    })

    await newBlacklist.save();

    res.setHeader('Clear-site-Data', '"cookies"');
    res.status(200).json({
        message: 'You are logged out'
    })

})

exports.protect = asyncErrorHandler(async (req, res, next) =>{
    const testToken = req.headers.authorization;
    let token
    if(testToken && testToken.startsWith('Bearer')){
        token= testToken.split(' ')[1]
    }
    if(!token){
       return  next(new CustomError('You are not logged in', 401))
    }

    //3. Check if the token is blacklisted

    const checkIfBlacklisted = await Blacklist.findOne({token})

    if (checkIfBlacklisted) {
        return res
            .status(401)
            .json({ message: 'This session has expired. Please login again.' });
    }

    //validate the token
    const decodedToken=  await promisify(jwt.verify)(token, process.env.SECRET_STR)
    // if the user exists in the db

    const user = await User.findById(decodedToken.id) // getting the id of the user through the decodedToken
    
    if(!user){
       return next(new CustomError('The user with the given token does not exist', 401))
    }

    if(!user.active){
        return next(new CustomError('User has been deactivated', 401))
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

exports.verifyUserStatus =asyncErrorHandler(async(req, res, next) =>{
    const userId= req.user._id

    const user = await User.findById(userId);

    if (!user || !user.active) {
        const error = new CustomError('Your account is disabled', 403);
        return next(error);
      }

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
    const password =`${firstName}${lastName}`.toLowerCase()
    console.log(password)
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

    const existingUser = await User.findOne({email})

    if (existingUser){
        const error = new CustomError('We could not find the user with this given email', 404)
        return next(error)
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
    message:`${req.user.email} has created a user`

})

const io = req.app.get('io');

io.emit('new-notification', notification);

createSendResponse(createUser, 201, res)

 }) 

 exports.forgotPassword = asyncErrorHandler(async (req, res, next) =>{
    //Get user based on posted email
    const user = await User.findOne({email:req.body.email})
    if(!user){
        const error = new CustomError('We could not find the user with this given email', 404)
        return next(error)
    }

    // Generate a random reset token if users exists
    const resetToken = user.createResetPasswordToken()

    await user.save({validateBeforeSave:false})

    // send the token back to the user email
    // const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`
    const resetUrl=`https://bnsl-app.onrender.com/reset-password?token=${resetToken}`
    // const message = `We have received a password reset request. Please use the below link to reset your password \n \n ${resetUrl} \n\n This reset password link will be valid on for 10 minutes.`
    const sent_to = user.email;
     const sent_from = process.env.EMAIL_USER;
    const reply_to = user.email;
    const subject = "PASSWORD RESET";
    const message = generatePasswordResetTemplate(resetUrl)

    
    try{
        await sendEmail(subject, message, sent_to, sent_from, reply_to)
    // await new Email(user,resetUrl).sendPasswordReset()
    res.status(200).json({
        status:'success',
        message:'Password reset link sent successfully'
    })
} catch(err){
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({validateBeforeSave:false})

    return next(new CustomError('There was an error sending password reset email. Please try again later', 500))
}
 })

 exports.resetPassword = asyncErrorHandler (async (req, res, next) =>{
    // IF THE USER EXISTS WITH THE GIVEN TOKEN AND TOKEN HAS NOT EXPIRED
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({passwordResetToken:token, passwordResetTokenExpires: {$gt:Date.now()}});
    if(!user){
        const error = new CustomError('Token is invalid or has expired', 400)
        next(error)
    }
    // RESETTING THE USER PASSWORD
    user.password = req.body.password
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now()

   await  user.save()

    const notification=await Notification.create({
        title:"Password reset",
        user:req.user._id,
        message:`${req.user.email} has reset their password`

    })
    const io = req.app.get('io');
    io.emit('new-notification', notification);

    //create a response
    createSendResponse(user, 200, res)


 })


