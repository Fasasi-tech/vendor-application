const mongoose= require('mongoose')

const rfqSchema = new mongoose.Schema({

    product: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    },
    buyer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    additionalInfo:{
        type:String
    },
    document:{
        public_id:{
            type:String,
        },
        url:{
            type:String
        }
    },
    status:{
        type:String,
        enum:['pending','Approved', 'Rejected'],
        default:'pending'
    },
    createdAt:{
        type:Date,
        default:Date.now

    }

})



const Rfq = mongoose.model('Rfq', rfqSchema)

module.exports=Rfq