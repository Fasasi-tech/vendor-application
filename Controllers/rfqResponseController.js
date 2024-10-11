// const RfqResponse = require("../Models/rfqResponseSchema");
// const Product = require("../Models/productModel")
// const asyncErrorHandler = require("../utils/asyncErrorHandler");
// const CustomError = require("../utils/CustomError");
// const { createSendResponse } = require("../utils/response");
// const Vendor=require('./../Models/vendorModel')
// const cloudinary = require('../utils/cloudinary');
// const { generateRfqEmail } = require("../utils/mail");
// const { sendEmail } = require("../utils/email");

// exports.createRfqResponse= asyncErrorHandler( async(req, res, next) =>{

//     const { attachment, rfq, product, customerEmail, AdditionalInfo} = req.body

//     const email= customerEmail
//     const user = req.user._id;

//     if (!user){
//         return next(new CustomError('user not found', 404))
//     }

//    const vendor= await Vendor.findOne({vendor:user})


//     const rfqbody={
//         vendor:vendor,
//         rfq,
//         product,
//         AdditionalInfo
//     }

//     if(attachment){
//         const result= await cloudinary.uploader.upload(attachment, {
//             folder:"rfqDocuments"
//         })

//         rfqbody.attachment ={
//             public_id:result.public_id,
//             url:result.secure_url
//         }
//     }


//     const rfqs = await RfqResponse.create(rfqbody)

//     const populateProduct= await Product.findById(product)
//     const getProductName= populateProduct.name
//     const getProductVendor= await Vendor.findById(vendor)
//     const getVendorName= getProductVendor.name

//     const emailResponseRfq = {
//         product: getProductName,
//         vendor:getVendorName,
//         information:AdditionalInfo
//     }

//     const sent_to=  email
//     const sent_from = process.env.EMAIL_USER
//     const reply_to = process.env.EMAIL_USER
//     const subject = 'RFQ RESPONSE'
//     const message = generateRfqEmail(emailResponseRfq)
//     const attachments =[]

//     const attach = attachment

//     if (attach) {
//         // Extract the base64 content
//         const base64Content = attach.split("base64,")[1];
//         // Determine the file type based on the content
//         const contentType = attach.includes('application/pdf')
//         ? 'application/pdf'
//         : attach.includes('application/msword')
//         ? 'application/msword'
//         : attach.includes('image/png')
//         ? 'image/png'
//         : 'application/octet-stream'; // Default for unknown types
    
//         attachments.push({
//             filename: attach.filename, // Adjust the filename based on the file type
//             contentType: contentType,
//             content: new Buffer.from(base64Content, "base64"),
//         });
//     }


//     await sendEmail(subject, message, sent_to, sent_from, reply_to, attachments)

//     createSendResponse(rfqs, 200, res)
// })