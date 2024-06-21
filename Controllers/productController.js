customError = require('../utils/CustomError')
const filteringFeatures = require('../utils/filteringFeatures')
const Product = require('./../Models/productModel')
const Vendor = require('./../Models/vendorModel')
const asyncErrorHandler = require('./../utils/asyncErrorHandler')
const {createSendResponse} = require('../utils/response')
const productHistoryLogSchema = require('./../Models/productHistoryLogSchema')
const CustomError = require('../utils/CustomError')
const deletedProductHistoryLogHistorySchema = require('./../Models/deletedHistoryLogModel')
const cron = require('node-cron');
const cloudinary = require('../utils/cloudinary')
const { sendEmail } = require('../utils/email')
const Review = require('./../Models/reviewSchema')
const Notification = require('../Models/notificationModel')



const logPreviousProduct = asyncErrorHandler(async(req, res, next) =>{
    
        const productId = req.params.id
        const previousProduct = await Product.findById(productId)
        req.previousProduct = previousProduct ? previousProduct.toJSON() : null;
        next()
})



exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {
    const features = new filteringFeatures(Product.find({}), req.query).filter().sort().paginate().limitFields()
  //  const products = await Product.find()
    const products = await features.query
    createSendResponse(products, 200, res)
})

exports.sendRequestForQuotation = asyncErrorHandler(async (req, res,next) => {
   const {messages, subjects, attach} = req.body

    const productId = req.params.id

  // Find the product by ID
  const product = await Product.findById(productId).populate({
    path: 'vendor',
    select:'email'
});

if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
}


const result=product.vendor.email
//const vendorEmail = user.email

console.log(result)



    const sent_to = result
    const sent_from = process.env.EMAIL_USER
    const reply_to = result
    const subject = subjects
    const message = messages
    const attachments = []

    if (attach){
        attachments.push({
            filename: 'Event.png',
            content: attach,
            encoding: 'base64',
        })
    }
    await sendEmail(subject, message, sent_to, sent_from, reply_to, attachments);
      
    res.status(200).json({
        status:'success',
        message:'Emails sent successfully'
    })



})

exports.createProduct = asyncErrorHandler(async (req, res, next) => {
    const vendor = await Vendor.findOne({user:req.user._id})

    if (!vendor) {
        return next(new CustomError('Vendor not found', 404))
    }

    const user = req.user

     // Check if the user exists
     if (!user) {
        return next(new CustomError('User not found', 404));
    }

    // Get the vendor name
    const vendorName = user._id;

    const {name, description, price, image, category} = req.body;
    const result = await cloudinary.uploader.upload(image, {
        folder: "products",
        // width:300,
        // crop:"scale"
    } )
    const newProduct ={
        name,
        price,
        description,
        image: {
            public_id:result.public_id,
            url:result.secure_url
        },
        vendor:vendorName,
        category,
        createdBy:vendor.name,

    }
     // Conditionally add creditTerm if it exists in the request body
     if (req.body.creditTerm) {
        newProduct.creditTerm = {
            value: req.body.creditTerm.value,
            unit: req.body.creditTerm.unit
        };
    }

    // Conditionally add leadTime if it exists in the request body
    if (req.body.leadTime) {
        newProduct.leadTime = {
            value: req.body.leadTime.value,
            unit: req.body.leadTime.unit
        };
    }

    const createProduct = await Product.create(newProduct)

    createSendResponse(createProduct, 201, res)
})

exports.editSingleProduct = asyncErrorHandler( async (req, res, next) =>{

    await logPreviousProduct(req, res, async () => {
        const vendor = await Vendor.findOne({user:req.user._id})
        if (!vendor) {
            return next(new CustomError('Vendor not found', 404));
        }
        
                 // Get the vendor name
    const vendorName = vendor.name;

        const user = req.user;

    if (!user) {
        return next(new CustomError('User not found', 404));
    }

 //current product
        const currentProduct = await Product.findById(req.params.id);

//build the data object
        const data ={
            name: req.body.name,
            description:req.body.description,
            price:req.body.price,
            category:req.body.category,
           createdBy:vendorName,
        }

// Conditionally add creditTerm if it exists in the request body
     if (req.body.creditTerm) {
        data.creditTerm = {
            value: req.body.creditTerm.value,
            unit: req.body.creditTerm.unit
        };
    }

// Conditionally add leadTime if it exists in the request body
    if (req.body.leadTime) {
        data.leadTime = {
            value: req.body.leadTime.value,
            unit: req.body.leadTime.unit
        };
    }


        //modify image conditionally
        if (req.body.image && req.body.image !==''){
            const ImgId = currentProduct.image?.public_id;
            if(ImgId){
                await cloudinary.uploader.destroy(ImgId);
            }
            const newImage = await cloudinary.uploader.upload(req.body.image, {
                folder: "products",
                width: 1000,
                crop: "scale"
            });

            data.image = {
                public_id: newImage.public_id,
                url: newImage.secure_url
            }

            
      

            
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            data,
            { new: true, runValidators: true }
        );

        if (req.previousProduct) {
            await productHistoryLogSchema.create({
                // productId: req.params.id,
                previousDetails: req.previousProduct,
                timeStamp: Date.now(),
                updatedBy: vendor.name
            });
        }

        const notification =await Notification.create({
            title:"Product Notification",
            user:req.user._id,
            message:`${vendorName} has updated their product`

        })

        const io = req.app.get('io');
        io.emits('new-notification', notification)

        createSendResponse(updatedProduct, 200, res);
    });
})

exports.getVendorProducts = asyncErrorHandler(async (req, res, next) =>{
      const vendor = await Vendor.findOne({user:req.user._id})
      console.log(vendor)
      if (!vendor){
        const error = new CustomError('vendor not found', 404)
        return next(error)
      }
      const getProduct = await Product.find({vendor:req.user._id, deleted:false})

      createSendResponse(getProduct, 200, res)
})

exports.getSingleProduct = asyncErrorHandler(async (req, res, next) =>{
    const singleProduct = await Product.findById(req.params.id)
    if (!singleProduct){
        const error = new CustomError('product with this ID is not found', 404)
        return next(error)
    }
    createSendResponse(singleProduct, 200, res)
})



exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
        const error = new CustomError('vendor not found')
        return next(error)
    }

    const product = await Product.findById(req.params.id )

    //retrieve current ID
    const imgId = product.image.public_id
    if(imgId){
        await cloudinary.uploader.destroy(imgId)
    }

    const comments = await Review.find({productid:req.param.id})
      
    // Function to recursively delete attachments in comments and replies
      const deleteAttachments = async (comment) => {
        if (comment.attachment && comment.attachment.public_id) {
            await cloudinary.uploader.destroy(comment.attachment.public_id);
        }

        for (const replyId of comment.replies) {
            // in mongodb the replies of comment (replyId) is always in id which is inside the replies array.
            const reply = await Review.findById(replyId);
            console.log(replyId)
            if (reply) {
                await deleteAttachments(reply);
                // this replyid also have a full document which we are trying to delete
                await Review.findByIdAndDelete(replyId);
            }
        }
    };

    // Loop through comments and delete attachments and comments
    for (const comment of comments) {
        await deleteAttachments(comment);
        await Review.findByIdAndDelete(comment._id); // Use findByIdAndDelete to delete the comment
    }

    const deletedProduct =await Product.findByIdAndUpdate(req.params.id, {deleted:true}, {new:true})

    const notification=await Notification.create({
        title:"Product Notification",
        user:req.user._id,
        message:`${vendor.name} has deleted their product`

    })

    const io = req.app.get('io');
    io.emits('new-notification', notification)

    const objDeletedProduct = deletedProduct.toJSON()
    if (deletedProduct){
        await deletedProductHistoryLogHistorySchema.create({
            productId:req.params.id,
            previousDetails: objDeletedProduct,
            timeStamp:Date.now(),

        })
    }
    res.status(204).json({
        status:'success',
        message:'Product has been deleted',
        data:null
    })
})

exports.getDeletedProduct = asyncErrorHandler(async (req, res, next) => {
   const deletedProduct= await deletedProductHistoryLogHistorySchema.find({})

   if (!deletedProduct){
    const error = new CustomError('deleted product not found')
    return next(error)
   }
   createSendResponse(deletedProduct, 200, res)
})

cron.schedule("2 * * * * *", async() => {
    //const thirtyDaysAge = new Date(Date.now() - 30* 24 * 60 * 60 * 1000)
 await Product.deleteMany({deleted:true})
})



exports.comment = asyncErrorHandler(async (req, res, next) => {
    const productId = req.params.id
    const product = await Product.findById(productId)
if (product){
    //Process attachment if present
    let attachment = null;
    if (req.body.attachment) {
        const newImage = await cloudinary.uploader.upload(req.body.attachment, {
            folder: "attachments",
            width: 500,
            crop: "scale"
        });
        attachment = {
            public_id: newImage.public_id,
            url: newImage.secure_url
        };
    }

    //new comment or reply data
    const commentData ={
        name: req.user.firstName,
        comment: req.body.comment,
        productId,
        repliedTo: req.body.repliedTo || null,
        replies: [],
        attachment: attachment 
    }
    const review = new Review(commentData);
    await review.save();


    if (req.body.repliedTo) {
        const parentReview = await Review.findById(req.body.repliedTo);
        if (!parentReview) {
          return res.status(400).json({ message: 'Parent Review Not Found' });
        }
       
        parentReview.replies.push(review._id);
        await parentReview.save();
      } else {
        product.reviews.push(review._id);
        await product.save();
      }

     
    res.status(201).json({ message: 'Review Created', review });
    
    }  else {
        res.status(404).send({ message: 'Product Not Found' });
      }
})

const deepPopulateReplies = (path, depth) => {
    if (depth === 0) return { path };
    return {
      path,
      populate: deepPopulateReplies('replies', depth - 1)
    };
  };

exports.getProductWithReviews = asyncErrorHandler(async (req, res) => {

    const product = await Product.findById(req.params.id).populate({
        path: 'reviews',
        populate: deepPopulateReplies('replies', 200)  // Adjust the depth as needed
      });
  
      if (!product) {
        return res.status(404).json({ message: 'Product Not Found' });
      }
  
      res.status(200).json({ product });

  });
  