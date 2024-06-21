const mongoose = require('mongoose')
const vendorSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'please enter your business name' ],
        unique:true,
    },
    description:{
        type:String,
        required:[true, 'Please add a description'],

    },
    user:{ type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    },
    vendor_class:{
        type:String,
        required:[true, 'Please add a vendor class'],
        enum: ["Food", "Feed", "Vet", "Service"] 

    },
    logo:{
        public_id:{
            type:String,
        },
        url:{
            type:String
        }
    },
    createdAt:{
        type:Date,
        default:Date.now()
       },
 
})

const Vendor = mongoose.model('Vendor', vendorSchema)

module.exports=Vendor