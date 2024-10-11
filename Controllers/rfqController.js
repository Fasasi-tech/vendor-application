const Rfq = require("../Models/requestForQuotation");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const cloudinary = require('../utils/cloudinary');
const { createSendResponse } = require("../utils/response");
const CustomError = require('../utils/CustomError');
const Vendor = require("../Models/vendorModel");
const Product = require("../Models/productModel");
const User = require("../Models/userModel");
const { sendEmail } = require("../utils/email");
const { generateRfqEmail, generateStatusRfqEmail } = require("../utils/mail");
const RfqResponse = require("../Models/rfqResponseSchema");
const Notification = require('../Models/notificationModel');
const FilteringFeatures = require("../utils/filteringFeatures");


exports.createRfq = asyncErrorHandler(async (req, res, next) =>{

    const {   additionalInfo, document, status }= req.body;

    if (!req.body.product) req.body.product= req.params.id

    

    const user= req.user._id
    if (!user){
        return next(new CustomError('user not found', 404))
    }
    const rfq={
        product:req.body.product,
        buyer:req.user._id,
        additionalInfo,
        status
    }
    if(document){
        const result = await cloudinary.uploader.upload(document, {
            folder:"rfqDocuments"
        })

        rfq.document ={
            public_id:result.public_id,
            url:result.secure_url
        }
    }

    
    const generateRfq = await Rfq.create(rfq)
    console.log(generateRfq)
    const populateProductId= await Product.findById(req.params.id)
    const getVendorBasedOnProductId=populateProductId.vendor
    const populateVendorId = await User.findById(getVendorBasedOnProductId)
    const getEmailBasedOnVendor=populateVendorId.email
   
    const populateUser =await User.findById(req.user._id)
    const generateUserName= populateUser.email
    const emailrfq={
        product:populateProductId.name,
        customer:generateUserName,
        additionalInfo,   
    }

        const sent_to= getEmailBasedOnVendor
        const sent_from = process.env.EMAIL_USER
        const reply_to = getEmailBasedOnVendor
        const subject = 'RFQ NOTIFICATION'
        const message= generateRfqEmail(emailrfq)
        const attachments = []
        console.log(req.body.document)
        const attach=req.body.document


        if (attach) {
            // Extract the base64 content
            const base64Content = attach.split("base64,")[1];
            // Determine the file type based on the content
            const contentType = attach.includes('application/pdf')
            ? 'application/pdf'
            : attach.includes('application/msword')
            ? 'application/msword'
            : attach.includes('image/png')
            ? 'image/png'
            : 'application/octet-stream'; // Default for unknown types
        
            attachments.push({
                filename: attach.filename, // Adjust the filename based on the file type
                contentType: contentType,
                content: new Buffer.from(base64Content, "base64"),
            });
        }
        
    
    await sendEmail(subject, message, sent_to, sent_from, reply_to, attachments)
    createSendResponse(generateRfq, 201, res)

    
   
})

exports.getRfq = asyncErrorHandler(async (req, res, next) =>{
    const user = req.user._id

    // const getAllRfq = await Rfq.find({}).sort({createdAt:-1}).populate('buyer','email').populate('product', 'name')
    const features= new FilteringFeatures(Rfq.find({}).sort({createdAt:-1}).populate('buyer','email').populate('product', 'name'), req.query).search().sort().paginate().limitFields()
    const getAllRfq= await features.query
    const count = await Rfq.find({})
    const countResult= count.length
    const product = await Product.find({vendor: user})
    console.log(product)
    const result =product.map((p, index)=>{
       return p.id
    })

     const getRfqBasedOnVendor= await Rfq.find({product:result}).populate('buyer','email').populate('product', 'name')
    
    console.log(getRfqBasedOnVendor)

    const isAdmin = req.user.role ==='admin' || req.user.role==='user' || req.user.role==='superAdmin' || req.user.role ==='R.O.A'
   
    const getRf= isAdmin ? {getAllRfq, countResult} : getRfqBasedOnVendor



    createSendResponse(getRf, 200, res)
})

exports.editRfq= asyncErrorHandler( async (req, res, next) =>{
    const {additionalInfo, status } = req.body
    const patchRfq =await Rfq.findByIdAndUpdate(req.params.id, {additionalInfo, status},  { new: true, runValidators: true }   )

    createSendResponse(patchRfq, 200, res)


})

exports.getSingleRfq= asyncErrorHandler(async (req, res, next) =>{

    const findSingleRfq = await Rfq.findById(req.params.id).populate('buyer', 'name email').populate('product', 'name price description'); 
        if(!findSingleRfq){
            return ('RFQ not found', 404)
        }
    createSendResponse(findSingleRfq, 200, res) 
})

exports.createRfqResponse= asyncErrorHandler( async(req, res, next) =>{

    const { attachment, rfq, product, customerEmail, AdditionalInfo} = req.body

    const email= customerEmail
    const user = req.user._id;

    if (!user){
        return next(new CustomError('user not found', 404))
    }

   const vendor= await Vendor.findOne({user:user})
    console.log('vendor', vendor)

    if (!vendor){
        return next(new CustomError('vendor not found', 404))
    }

    const rfqbody={
        vendor:vendor,
        rfq,
        product,
        AdditionalInfo,
        customerEmail
    }

    if(attachment){
        const result= await cloudinary.uploader.upload(attachment, {
            folder:"rfqDocuments"
        })

        rfqbody.attachment ={
            public_id:result.public_id,
            url:result.secure_url
        }
    }


    const rfqs = await RfqResponse.create(rfqbody)

    const populateProduct= await Product.findById(product)
    const getProductName= populateProduct.name
    const getProductVendor= await Vendor.findById(vendor)
    const getVendorName= getProductVendor.name

    const emailResponseRfq = {
        product: getProductName,
        vendor:getVendorName,
        information:AdditionalInfo
    }

    const sent_to=  email
    const sent_from = process.env.EMAIL_USER
    const reply_to = process.env.EMAIL_USER
    const subject = 'RFQ RESPONSE'
    const message = generateStatusRfqEmail(emailResponseRfq)
    const attachments =[]

    const attach = attachment

    if (attach) {
        // Extract the base64 content
        const base64Content = attach.split("base64,")[1];
        // Determine the file type based on the content
        const contentType = attach.includes('application/pdf')
        ? 'application/pdf'
        : attach.includes('application/msword')
        ? 'application/msword'
        : attach.includes('image/png')
        ? 'image/png'
        : attach.includes('image/jpeg')  // Add support for .jpg and .jpeg
        ? 'image/jpeg'
        : 'application/octet-stream'; // Default for unknown types
    
        attachments.push({
            filename: attach.filename, // Adjust the filename based on the file type
            contentType: contentType,
            content: new Buffer.from(base64Content, "base64"),
        });
    }

    

    await sendEmail(subject, message, sent_to, sent_from, reply_to, attachments)

    const notification = await Notification.create({
        title:'RFQResponse',
        user:req.user._id,
        message:`${getVendorName} has responded to RFQ`
    })

    const io = req.app.get('io');
        io.emit('new-notification', notification)

    createSendResponse(rfqs, 200, res)
})

exports.getSingleRfqResponse= asyncErrorHandler(async(req, res, next) =>{
    const Rfq = await RfqResponse.findById(req.params.id).populate('rfq').populate('vendor').populate('product', 'name') 

    if (!Rfq){
        const error = new CustomError('Rfq with this ID is not found!', 404)
        return next(error)
    }

    createSendResponse(Rfq, 200, res)

})

exports.RfqResponses = asyncErrorHandler(async(req, res, next) =>{
    // const Rfqs = await RfqResponse.find({}).populate('rfq').populate('vendor') 
    // .populate('product');

    const features = new FilteringFeatures(RfqResponse.find({}).sort({createdAt:-1}).populate('rfq').populate('vendor').populate('product'), req.query).search().sort().paginate().limitFields()
    const Rfqs = await features.query
    const count = await RfqResponse.find({})
    const countResult = count.length
    createSendResponse({Rfqs, countResult}, 200, res)

})






