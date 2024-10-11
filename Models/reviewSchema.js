// const mongoose = require('mongoose');

// const reviewSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     comment: { type: String, required: true },
//     attachment:{

//       public_id:{
//       type:String,
     
//     },
//     url:{
//       type:String,
//     }
//   },
//     productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
//     repliedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
//     replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
//   },
//   {
//     timestamps: true,
//   }
// );

// const Review = mongoose.model('Review', reviewSchema);
// module.exports = Review;

const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  review: {
    type:String,
    required:[true, 'Review cannot be empty!']
  },
  ratings:{
    type:Number,
    min:1,
    max:5
  },
  createdAt:{
    type:Date,
    default:Date.now
  },
  user:{
    type:mongoose.Schema.ObjectId,
    ref:'User',
    required:[true, 'Review must be created by a user']
  },
  product:{
    type:mongoose.Schema.ObjectId,
    ref:'Product',
    required:[true, 'Review must be created by a user']
  },

})

reviewSchema.pre(/^find/, function(next){
  this.populate({
    path:'user'
  })
  next()
})

const Review = mongoose.model('productReview', reviewSchema);
module.exports = Review;
