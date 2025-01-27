const mongoose = require('mongoose')



const notificationSchema = new mongoose.Schema({
    title:String,
    message:String,
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
    
}, {timestamps:true})

const Notification = mongoose.model('Notification', notificationSchema)

module.exports = Notification