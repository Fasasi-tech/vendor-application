const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    attachment:{

      public_id:{
      type:String,
     
    },
    url:{
      type:String,
    }
  },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    repliedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
