const mongoose = require('mongoose')

const CustomerRfq = new mongoose.Schema({
    serialNo:{
        type:String
    },
    product:{
        type:String,
        required:[true, 'Please input your product!']
    },
    description:{
        type:String,
        required:[true, 'Please input a description']
    },
    categories:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category'
    }],
    document:{
        public_id:{
            type:String,
        },
        url:{
            type:String
        }
    },
    responses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'CustomerResponseRfq'
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now

    }
},  {timestamps:true} )


const Customer = mongoose.model('CustomerRfq', CustomerRfq)

module.exports = Customer