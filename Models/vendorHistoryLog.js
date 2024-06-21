const mongoose = require("mongoose")

const vendorLogHistorySchema = new mongoose.Schema({
   
    previousDetails:{
        type:Object
    },
    timeStamp:{
        type:Date, 
    Default:Date.now(),
    
    },
    updatedBy:{

        type:mongoose.Schema.Types.ObjectId, ref:'User'
    }
})

const VendorLogHistory = mongoose.model('VendorLogHistory', vendorLogHistorySchema)

module.exports = VendorLogHistory