const Rfq = require("../Models/requestForQuotation");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const cloudinary = require('../utils/cloudinary');
const { createSendResponse } = require("../utils/response");
const CustomError = require('../utils/CustomError');
const Vendor = require("../Models/vendorModel");
const Product = require("../Models/productModel");
const User = require("../Models/userModel");
const { sendEmail } = require("../utils/email");
const { generateRfqEmail } = require("../utils/mail");


exports.createRfq = asyncErrorHandler(async (req, res, next) =>{

    const {product, quantity, buyer, additionalInfo, document, status }= req.body;

    

    const user= req.user._id
    if (!user){
        return CustomError('user not found', 404)
    }

    const rfq={
        product,
        quantity,
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
    const populateProductId= await Product.findById(product)
    const getVendorBasedOnProductId=populateProductId.vendor
    const populateVendorId = await User.findById(getVendorBasedOnProductId)
    const getEmailBasedOnVendor=populateVendorId.email
   
    const populateUser =await User.findById(req.user._id)
    const generateUserName= populateUser.email
    const emailrfq={
        product:populateProductId.name,
        quantity,
        buyer:generateUserName,
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
        // if (attach){
        //     attachments.push({
        //         filename: 'Events.png',
        //         contentType:  'image/jpeg',
        //         content: new Buffer.from(attach.split("base64,")[1], "base64"),
               
        //     })
        // }

        if (attach) {
            // Extract the base64 content
            const base64Content = attach.split("base64,")[1];
            // Determine the file type based on the content
            const contentType = attach.includes('application/pdf') ? 'application/pdf' : 'application/msword';
        
            attachments.push({
                filename: 'Document.pdf', // Adjust the filename based on the file type
                contentType: contentType,
                content: new Buffer.from(base64Content, "base64"),
            });
        }
        
    
    await sendEmail(subject, message, sent_to, sent_from, reply_to, attachments)
    createSendResponse(generateRfq, 201, res)

    
   
})

exports.getRfq = asyncErrorHandler(async (req, res, next) =>{
    const user = req.user._id

    const getAllRfq = await Rfq.find({})
    const product = await Product.find({vendor: user})
    console.log(product)
    const result =product.map((p, index)=>{
       return p.id
    })

    const getRfqBasedOnVendor= await Rfq.find({product:result})
    console.log(getRfqBasedOnVendor)

    const isAdmin = req.user.role ==='admin' || req.user.role==='user' || req.user.role==='superAdmin' || req.user.role ==='R.O.A'
   
    const getRf= isAdmin ? getAllRfq : getRfqBasedOnVendor



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



