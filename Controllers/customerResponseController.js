const CustomerResponseRfq = require('../Models/customerResponseRfq')
const asyncErrorHandler = require('../utils/asyncErrorHandler')
const CustomError = require('../utils/CustomError')
const cloudinary = require('../utils/cloudinary')
const { createSendResponse } = require('../utils/response')
const Vendor = require('../Models/vendorModel')
const CustomerRfq = require('../Models/customerRfq')
const Notification = require("../Models/notificationModel");

exports.rfqResponse = asyncErrorHandler(async (req, res, next) =>{
    const {product, customerRfq } = req.body;
    // if (!customerRfq) customerRfq= req.params.id
        //if(!vendor) vendor= await Vendor.findById(req.user._id).select('_id')
        
    if (!product || !customerRfq){
        const error = new CustomError('There is a missing field ', 400)
        return next (error)
    }

    const singleVendor = await Vendor.findOne({user: req.user._id})

    if (!singleVendor){
        return next(new CustomError('user not found', '404'))
    }

    const vendorResult = singleVendor._id;
    const vendorname = singleVendor.businessName

    const {name, price, image,  productDetails, creditTerm, leadTime} =product;

    if (!name || !price ||!productDetails ||!image){
        return next (new CustomError('There is a missing field', 400))
    }

    const imageResult= await cloudinary.uploader.upload(image, {
        folder:"products"
    })

    const {value, unit} = creditTerm
    const {value:leadTimeValue, unit:leadTimeUnit} = leadTime



    const embdProduct ={
        name,
        price,
        image:{
            public_id:imageResult.public_id,
            url:imageResult.secure_url
        },
        productDetails,
        creditTerm:{
            value,
            unit
        },
        leadTime:{
            value:leadTimeValue,
           unit:leadTimeUnit
        }
    }

    const rfq=await CustomerRfq.findById(customerRfq)

    const createRfqResponse = {
        product:embdProduct,
        vendor:vendorResult,
        customerRfq
    }

   const result= await CustomerResponseRfq.create(createRfqResponse)

   rfq.responses.push(result._id)
   await rfq.save()

   singleVendor.products.push(result._id)
   await singleVendor.save()

   const notification = await Notification.create({
     title:'vendor response',
     user:req.user._id,
     message:`${vendorname} has responded to an RFQ`
   })

   const io = req.app.get('io');
   io.emit('new-notification', notification);

   createSendResponse(result, 200, res)
})

exports.getMyRfqResponse = asyncErrorHandler( async(req, res, next) =>{
    
  const vendor =  await Vendor.find({user:req.user._id})

  if(!vendor){
    const error = new CustomError("this vendor is not found", 400)
    return next(error);
  }

  const vendorId= vendor._id
    const findVendorRfq = await CustomerResponseRfq.find({vendor:vendorId})
    createSendResponse(findVendorRfq,200,res)
})

exports.allResponses = asyncErrorHandler(async (req, res, next) =>{
    const rfqResponses = await CustomerResponseRfq.find().populate('vendor', '-products').populate({path:'vendor', populate:{path:'vendor_class'}}).sort({createdAt:-1})
    createSendResponse(rfqResponses, 200, res)
})

exports.RfqResponseAggregate = asyncErrorHandler(
    async (req, res, next) =>{
        const rfqAggregate = await CustomerResponseRfq.aggregate([
            {
                $group:{
                    _id: "null",
                    count:{$sum:1}
                }
            }
        ])

        createSendResponse(rfqAggregate, 200, res)
    }
)


exports.filterResponseBasedOnVendor = asyncErrorHandler(async (req, res, next) =>{
    const vendor= await Vendor.find({user:req.user._id})
    const rfqResponsesById = await CustomerResponseRfq.find({vendor}).populate('vendor', '-products').populate({path:'vendor', populate:{path:'vendor_class'}}).sort({createdAt:-1})
    createSendResponse(rfqResponsesById, 200, res)
})

exports.singleRfqResponses= asyncErrorHandler(async (req, res, next) =>{
    const singleRfqResponse = await CustomerResponseRfq.findById(req.params.id).populate('vendor', '-products').populate({path:'vendor', populate:{path:'vendor_class'}})
    createSendResponse(singleRfqResponse, 200, res)
})