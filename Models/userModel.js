const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { timeStamp } = require('console')

//  name, email, password, photo
const userSchema = new mongoose.Schema({
   email:{
    type:String,
    required:[true, 'please enter an email.'],
    unique:true,
    lowercase:true,
    validate: [validator.isEmail, 'Please enter a valid email']
   },
   password:{
    type:String,
    required:[true, 'Please enter a password.'],
    select:false //do not get password in the response. i dont want to send the field to the frontend
   },
   active:{
    type:Boolean,
    default:true,
   },
   superAdmin:{
    type:Boolean,
    default:false
   },

   permissions:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:'permission'
   }],

   group:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'group'
   },

   passwordChangedAt:Date,
   passwordResetToken:String,
   passwordResetTokenExpires:Date


},  {timestamps:true},

)

userSchema.pre('save', async function(next){
    if(!this.isModified('password'))
        next()
       this.password=await bcrypt.hash(this.password, 12)
       next()
}) 



//comparing the password in the db with the one the user has entered in the login
userSchema.methods.comparePasswordInDb = async function(pswd, pswdDb){
  return  await  bcrypt.compare(pswd, pswdDb)
}
// changing password function. you will have to login first before you get your token again
userSchema.methods.isPasswordChanged = async function (JWTTimestamp){
    // only if the password was changed, that is when you will see the field passwordChangedAt
    if (this.passwordChangedAt){
         const pswdChangedTimeStamp = parseInt(this.passwordChangedAt.getTime()/10000, 10)
         return JWTTimestamp < pswdChangedTimeStamp // password was changed after jwt was issued
        }
    return false

}
userSchema.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetTokenExpires = Date.now() + 10*60*1000

    return resetToken
}
const User = mongoose.model('User', userSchema)

module.exports=User