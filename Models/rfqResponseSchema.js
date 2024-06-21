const mongoose= require('mongoose')

const rfqResponseSchema = new mongoose.Schema({

    rfq:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Rfq'
    },
    vendor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    amount:{
        type:Number
    },
    attachment:{
        public_id:{
            type:String
        },
        url:{
            type:String
        }
    },
    createdAt:{
        type:Date,
        default:Date.now()

    }
})

const RfqResponse= mongoose.Model('RfqResponse', rfqResponseSchema )

module.exports = RfqResponse