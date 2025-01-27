const mongoose = require("mongoose")

const vendorLogHistorySchema = new mongoose.Schema({
   
    previousDetails:{
        type:Object
    },
    currentDetails: {
        type: Object,
    },
    action:{
        type:String
    },
   
    updatedBy:{

        type:mongoose.Schema.Types.ObjectId, ref:'User'
    }
},
{timestamps:true})

const VendorLogHistory = mongoose.model('VendorLogHistory', vendorLogHistorySchema)

module.exports = VendorLogHistory