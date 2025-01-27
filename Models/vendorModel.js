const mongoose = require('mongoose')
const category= require('./../Models/categoryModel')

const vendorSchema = new mongoose.Schema({
    businessName:{
        type:String,
        required:[true, 'please enter your business name' ],
    },
    phoneNumber: {
        type:String,
        required:[true, 'please add your phone number']
    },
 
    bankAccountDetails:{
        accountName: String,
        accountNumber: String,
        bankName: String,
    },
    address:{
        state:String,
        country:String,
        businessAddress:String
    },
    user:{ type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    },
    vendor_class:[{
       type:mongoose.Schema.Types.ObjectId,
       ref:'category' 
    }],
    products:[{
       type:mongoose.Schema.Types.ObjectId,
       ref:'CustomerResponseRfq' 
    }
    ],
    logo: {
        public_id: {
            type: String,
           
        },
        url: {
            type: String,
            
        }
    }
},
{timestamps:true}
)

vendorSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update.$set && update.$set.vendor_class) {
        // Pull out vendors from categories that are no longer related
        await category.updateMany(
            { vendors: this._conditions._id }, 
            { $pull: { vendors: this._conditions._id } }
        );
        
    }
    next();
});


const Vendor = mongoose.model('Vendor', vendorSchema)

module.exports=Vendor