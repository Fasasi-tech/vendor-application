const mongoose = require('mongoose')

const deletedProductHistoryLogHistorySchema =new mongoose.Schema({
    productId:{type:mongoose.Schema.Types.ObjectId, ref:'Product'},
    previousDetails:{type:Object},
    timeStamp:{type:Date, 
    Default:Date.now(),
    } 
})

const deletedProductHistoryLogHistory = mongoose.model('deletedProductHistoryLogHistory', deletedProductHistoryLogHistorySchema)

module.exports = deletedProductHistoryLogHistory;