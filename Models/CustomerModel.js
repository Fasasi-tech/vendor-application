const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    firstName:{
        type:String,
        required:[true, 'first name is required!']
    },
    lastName:{
        type:String,
        required:[true, 'last name is required']
    },
    address:{
        state:String,
        country:String
    },
    phoneNumber:String,
    maritalStatus:{
        type:String,
        enum:['Single','Married', 'Divorced'],
    },
    gender:{
        type:String,
        enum:['Male', 'Female']
    },
    image:{
        public_id: {
            type: String,
           
        },
        url: {
            type: String,
           
        }
    }
    
}, {timestamps:true})

const Customer = mongoose.model('Customer', customerSchema)

module.exports= Customer