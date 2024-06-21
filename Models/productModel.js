const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'product name is required!'],
    },
    price:{
        type:Number,
        required:[true, 'product price is required!']

    },
    description:{
        type:String,
        required:[true, 'description is required!']
    },
    image:{
     
      public_id:{
        type:String,

      },
      url:{
        type:String,
       
      }
    },

    vendor:{ 
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
        
    },

    category:{
    type:String,
    enum:['Food', 'Vet', 'Feed'],
    required:[true, 'category is required']
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
    createdAt:{
        type:Date,
        default:Date.now()

    },
    createdBy:{
        type:String,
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    // reviews:[reviewSchema],
    deleted:{
        type:Boolean,
        default:false,
       } 
}
)

const Product = mongoose.model('Product', productSchema)

module.exports=Product;