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
    city:{
        type:String,
        required:[true, 'please add your city']
    },

    address:{
        type:String,
        required:[true, 'please add your address']
    },
    user:{ type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    },
    vendor_class:{
        type:String,
        required:[true, 'Please add a vendor class'],
        enum: ["Food", "Feed", "Vet", "Service"] 

    },
    logo: {
        public_id: {
            type: String,
            required: [true, 'Public ID is required'], // required for public_id
        },
        url: {
            type: String,
            required: [true, 'URL is required'], // required for url
        }
    },
    createdAt:{
        type:Date,
        default:Date.now
       },
 
})

const Vendor = mongoose.model('Vendor', vendorSchema)

module.exports=Vendor