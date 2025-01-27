const CustomerRfq = require('../Models/customerRfq')
const asyncErrorHandler = require('../utils/asyncErrorHandler')
const CustomError = require('../utils/CustomError')
const { generateCustomerRfqEmail } = require('../utils/mail')
const cloudinary = require('../utils/cloudinary');
const {createSendResponse} = require('../utils/response')
const Category = require('./../Models/categoryModel')
const Vendor = require('./../Models/vendorModel')
const User = require('./../Models/userModel')
const { sendEmail } = require("../utils/email");
const FilteringFeatures = require('../utils/filteringFeatures');

exports.createRfq = asyncErrorHandler(async (req, res, next) => {

    const { product, description, categories, document } = req.body; // Updated 'category' to 'categories'

    if (!product || !description || !categories || categories.length === 0) {
        const error = new CustomError('There is a missing field in the RFQ', 400);
        return next(error);
    }

    const emailRfq = { product, description };

    const createRfq = { product, description, categories };

    if (document) {
        const result = await cloudinary.uploader.upload(document, {
            folder: "rfqDocuments"
        });

        createRfq.document = {
            public_id: result.public_id,
            url: result.secure_url
        };

        emailRfq.document = {
            public_id: result.public_id,
            url: result.secure_url
        };
    }

    const generateCustomerRfq = await CustomerRfq.create(createRfq);

    // Find vendors associated with each category
    for (const categoryId of categories) {
        const category = await Category.findById(categoryId);

        if (!category) {
            const error = new CustomError('Category not found!', 404);
            return next(error);
        }

        const vendorIds = category.vendors;
        let vendorEmail;

        for (const vendorId of vendorIds) {
            const vendor = await Vendor.findById(vendorId);
            const user = await User.findById(vendor?.user);

            vendorEmail = user?.email;
            if (vendorEmail) {
                const sent_to = vendorEmail;
                const sent_from = process.env.EMAIL_USER;
                const reply_to = process.env.EMAIL_USER;
                const subject = 'CUSTOMER REQUEST FOR RFQ';
                const message = generateCustomerRfqEmail(emailRfq);
                const attachments = [];
                if (document && document.includes("base64,")) {
                    const base64Content = document.split("base64,")[1];
                    
                    let contentType = 'application/octet-stream'; // Default fallback
                
                    if (document.includes('application/pdf')) {
                        contentType = 'application/pdf';
                    } else if (document.includes('application/msword')) {
                        contentType = 'application/msword';
                    } else if (document.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
                        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    } else if (document.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
                        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    } else if (document.includes('application/vnd.ms-excel')) {
                        contentType = 'application/vnd.ms-excel';
                    } else if (document.includes('image/png')) {
                        contentType = 'image/png';
                    }
                
                    if (base64Content && base64Content.trim()) {
                        const buffer = new Buffer.from(base64Content, "base64");
                
                        // Dynamically set filename based on content type
                        let fileExtension = '';
                        if (contentType.includes('pdf')) {
                            fileExtension = '.pdf';
                        } else if (contentType.includes('word')) {
                            fileExtension = '.docx';
                        } else if (contentType.includes('spreadsheet')) {
                            fileExtension = '.xlsx';
                        } else if (contentType.includes('image')) {
                            fileExtension = '.png';
                        }
                
                        const filename = `document${fileExtension}`;
                
                        attachments.push({
                            filename: filename, // Dynamically set the filename
                            contentType: contentType,
                            content: buffer
                        });
                    } else {
                        console.error("Base64 content is invalid or empty");
                    }
                } else {
                    console.error("Invalid or empty document");
                }
                
                await sendEmail(subject, message, sent_to, sent_from, reply_to, attachments);
            }
        }
    }

    createSendResponse(generateCustomerRfq, 201, res);
});

exports.vendorsRfq = asyncErrorHandler (async (req, res, next) =>{
    const user = req.user._id
    const queryVendor=await Vendor.find({user}).select('vendor_class -_id')
    console.log(queryVendor, 'queryVendor')
    const vendorCategories= queryVendor.map(vendor => vendor.vendor_class).flat()
    console.log(vendorCategories, 'vendorCategories')
    if (!vendorCategories.length) {
        return next(new CustomError('No vendor classes found for this user', 404));
    }
    const vendorRfq= await CustomerRfq.find({categories:{$in:vendorCategories}}).select('-responses')
    

    createSendResponse(vendorRfq, 200, res)
})

exports.getAllRfq= asyncErrorHandler(async (req, res, next) =>{

    const features = new FilteringFeatures(CustomerRfq.find({}).populate({
        path: 'responses',
        select:'-customerRfq',
        populate: {
          path: 'vendor',
          select:"businessName"
        }}), req.query).search().paginate().limitFields()

        const getRfq = await features.query

        const count = await CustomerRfq.find({})

        const result =  count.length

    createSendResponse({getRfq, result}, 200, res)
})

exports.RfqAggregate = asyncErrorHandler(
    async (req, res, next) =>{
        const rfqAggregate = await CustomerRfq.aggregate([
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



exports.singleRfq = asyncErrorHandler(async (req, res, next) =>{

    const result=await CustomerRfq.findById(req.params.id).populate('responses').populate({path:"responses", populate:{path:'vendor'}}).populate("categories")

    createSendResponse(result, 200, res)
})



