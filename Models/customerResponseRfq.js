const mongoose = require('mongoose')

const CustomerResponseRfqSchema = new mongoose.Schema({
    serialNo:{
        type:String
    },
    customerRfq:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Customer',
        required:[true, 'customer Rfq is required']
    },
    product:{
        name:{
            type:String,
            required:[true, 'product name is required!'],
        },
        price:{
            type:Number,
            required:[true, 'product price is required!']
    
        },
        image:{
     
            public_id:{
              type:String,
      
            },
            url:{
              type:String,
             
            }
          },
          creditTerm:{
            value:{
             type:Number,
             min:0,
             default:null
         },
         unit:{
             type:String,
             enum:['D', 'W', 'M', 'Y'],
             default:null
         }
     },
         leadTime: {
             value: {
                 type:Number,
                 min:0, 
                 default:null
             },
             unit:{
                 type:String,
                 enum:['D', 'W', 'M', 'Y'],
                 default:null
             }
         },
      
         
          productDetails:{
            type:String,
            required:[true, 'product details is required']
        },

    },
    vendor:{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
       
   },
   createdAt:{
    type:Date,
    default:Date.now
   }
},
{timestamps:true}
)

CustomerResponseRfqSchema.pre('save', async function (next){
    if (!this.serialNo){
        const count = await mongoose.model('CustomerResponseRfq').countDocuments()
        this.serialNo = `RFQ${String(count +1).padStart(3, '0')}`
    }

    next()
})


const CustomerResponseRfq = mongoose.model('CustomerResponseRfq', CustomerResponseRfqSchema)

module.exports= CustomerResponseRfq;