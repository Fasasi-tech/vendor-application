const mongoose = require("mongoose");

const productHistoryLogSchema = new mongoose.Schema({

    previousDetails:{
        type:Object
    },
    timeStamp:{
        type:Date, 
    Default:Date.now(),
    
    },
    updatedBy:{

        type:String
    }
})

const ProductHistoryLog = mongoose.model('ProductHistoryLog', productHistoryLogSchema)

module.exports=ProductHistoryLog