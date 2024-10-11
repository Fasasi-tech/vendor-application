const mongoose= require('mongoose')

const rfqResponseSchema = new mongoose.Schema({

    rfq:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Rfq'
    },
    vendor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Vendor'
    },
    AdditionalInfo:{
        type:String,
        required:[true, 'This field is required']
    },
    product:{
         type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    },
    attachment:{
        public_id:{
            type:String
        },
        url:{
            type:String
        }
    },
    customerEmail:{
        type:String,
        required:[true, 'customer email is required']
    },
    createdAt:{
        type:Date,
        default:Date.now

    }
})

const RfqResponse= mongoose.model('RfqResponse', rfqResponseSchema )

module.exports = RfqResponse