const Vendor = require("../Models/vendorModel");
const CustomError = require("../utils/CustomError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const FilteringFeatures = require('../utils/filteringFeatures')
const jwt = require('jsonwebtoken')
const cloudinary = require('../utils/cloudinary');
const VendorLogHistory = require("../Models/vendorHistoryLog");
const Notification = require("../Models/notificationModel");
const {createSendResponse, createSendResponseAuth} = require('../utils/response')
const Category = require("../Models/categoryModel");
const User = require("../Models/userModel");

    const logUpdatedVendor = asyncErrorHandler (async (req, res, next) => {
        const vendorId= req.params.id;
        const beforeUpdateVendor = await Vendor.findById(vendorId)
        req.beforeUpdateVendor =beforeUpdateVendor? beforeUpdateVendor.toObject() :null

        next()

    })

    const logUpdatedVendorSelf = asyncErrorHandler (async (req, res, next) => {
        const vendorId= req.user._id;
        const beforeUpdateVendor = await Vendor.findOne({user:vendorId})
        req.beforeUpdateVendorSelf =beforeUpdateVendor? beforeUpdateVendor.toObject() :null

        next()

    })

exports.createVendor = asyncErrorHandler(async (req, res, next) => {
    const {businessName, vendor_class, logo, bankAccountDetails, user, address, phoneNumber} = req.body

    if (!businessName ||!vendor_class ||!logo ||!address ||!bankAccountDetails ||!phoneNumber){
        const error= new CustomError('The vendor field is not populated correctly', 400)
        return next(error)
    }

    const {accountName, accountNumber, bankName} = bankAccountDetails

    const {state, country, businessAddress} = address

    if (!accountName || !accountNumber || !bankName){
        const error= new CustomError('The vendor field is not populated correctly', 400)
        return next(error)
    }

    if (!state || !country || !businessAddress){
        const error= new CustomError('The vendor field is not populated correctly', 400)
        return next(error)
    }
    

    const result = await cloudinary.uploader.upload(logo, {
        folder: "logos",
        width:300,
        crop:"scale"
    } )

    const newVendor = {
        businessName,
        vendor_class,
        logo: {
            public_id:result.public_id,
            url:result.secure_url
        },
        bankAccountDetails:{
            accountName,
            accountNumber,
            bankName
        },
        address:{
            state,
            country,
            businessAddress
        },
        user,
        phoneNumber
    }

    const existingVendor= await Vendor.findOne({$or: [{businessName}, {user}]})

    if (existingVendor){

    if (existingVendor.businessName ===businessName){
        const error=new CustomError('businessName already exist', 400)
        return next(error)
    }

    if (existingVendor.user.toString() === user.toString()){
        console.log(existingVendor.user.toString())
        const error=new CustomError('user already exist', 400)
        return next(error)
    }

}

    const createVendors = await Vendor.create(newVendor)
    console.log(createVendors, 'create vendor')
    // we are adding the id that matches the vendor_class array in the category table, if it is present the poplate the venors array in the category field
    await Category.updateMany({"_id":{$in:vendor_class}},
        {$addToSet:{vendors: createVendors._id}}
    )

    const users = await User.findOne({_id:req.user._id})

    const email = users.email;


    const notification= await Notification.create({
        title:"Create Vendor",
        user:req.user._id,
        message:`${email} has created a vendor account`

    })

    const io = req.app.get('io');

    io.emit('new-notification', notification);

    createSendResponse(createVendors, 200, res)
    
})

exports.getAllVendors = asyncErrorHandler(async (req, res, next) => {

    const features= new FilteringFeatures(Vendor.find({}).populate('user'), req.query).search().sort().paginate().limitFields()
    const getVendors = await features.query
    const count = await Vendor.find({})
    // const getAllVendors = await features.query
    const result = count.length
    createSendResponse({getVendors, result}, 200, res)


})

exports.getVendorAndUpdate = asyncErrorHandler(async (req, res, next) => {
    await logUpdatedVendor(req, res, async () => {

        const {businessName, vendor_class, logo, bankAccountDetails={}, address ={}, phoneNumber} = req.body

        const {accountName, accountNumber, bankName} = bankAccountDetails

        const {state, country, businessAddress} = address


        // Save updated vendor
        const vendor = await Vendor.findById(req.params.id)

        if (!vendor){
            const error = new CustomError('vendor with this id is not found', 400)

        return next(error)
        }

        const data={
            businessName,
            vendor_class,
            bankAccountDetails:{
                accountName: accountName || vendor.bankAccountDetails?.accountName,
                accountNumber: accountNumber || vendor.bankAccountDetails?.accountNumber, 
                bankName: bankName || vendor.bankAccountDetails?.bankName
            },
            address:{
                state: state || vendor.address?.state,
                country: country || vendor.address?.country ,
                businessAddress: businessAddress || vendor.address?.businessAddress
            },
        
            phoneNumber
        }
        if (logo && logo !==''){
            const logoId = vendor.logo?.public_id;
        
            if(logoId){
                await cloudinary.uploader.destroy(logoId)
            }
        
            const newImage = await cloudinary.uploader.upload(logo, {
                folder:"logos",
                width:300,
                crop:"scale"
            })
        
            data.logo ={
                public_id:newImage.public_id,
                url:newImage.secure_url
            }

            if (vendor_class){
                const validClass = await Category.find({_id:{$in :vendor_class}}).select('_id');
                data.vendor_class = validClass.map((vc) => vc._id);
            }
        }

            const updatedVendor = await Vendor.findByIdAndUpdate(req.params.id, data, {new:true, runValidators:true} )
       console.log(updatedVendor, "update")


        try {
            await VendorLogHistory.create({
                previousDetails: req.beforeUpdateVendor,
                currentDetails: updatedVendor,
                timeStamp: Date.now(),
                updatedBy: req.user._id,
                action: req.method,
            });

            const notification = await Notification.create({
                title: "Vendor Profile",
                user: req.user._id,
                message: `${req.user.email} updated a vendor's account`,
            });

            const io = req.app.get('io');
            io.emit('new-notification', notification);
        } catch (error) {
            console.error("Error creating log or notification:", error);
        }

        createSendResponse(updatedVendor, 200, res);
    });
});


exports.getSingleVendor=asyncErrorHandler(async (req, res, next) => {
    const singleVendor = await Vendor.findById(req.params.id).populate({path:'user', populate:{path:'group'}}).populate({path:'user', populate:{path:'permissions'}}).populate('vendor_class')

    if (!singleVendor){
        const error = new CustomError('vendor with this ID is not found', 404)
        return next(error)
    }
    createSendResponse(singleVendor, 200, res)
})

exports.getVendorSelfAndPatch = asyncErrorHandler(async (req, res, next) => {

    await logUpdatedVendorSelf( req, res, async () => {
        const {businessName, phoneNumber,  address={}, bankAccountDetails={}} = req.body

        const {accountName, accountNumber, bankName} = bankAccountDetails

        const {state, country, businessAddress} = address

        const vendor = await Vendor.findOne({user:req.user._id})
        
        if(!vendor){
            const error = new CustomError('vendor with this ID is not found', 404)
            return next(error)
        }

        const data ={
            businessName,
            bankAccountDetails:{
                accountName: accountName || vendor.bankAccountDetails?.accountName,
                accountNumber: accountNumber || vendor.bankAccountDetails?.accountNumber, 
                bankName: bankName || vendor.bankAccountDetails?.bankName
            },
            address:{
                state: state || vendor.address?.state,
                country: country || vendor.address?.country ,
                businessAddress: businessAddress || vendor.address?.businessAddress
            },
        
            phoneNumber
        
        }

        if (req.body.logo && req.body.logo !==''){
            const logoId = vendor.logo?.public_id;

            if(logoId){
                await cloudinary.uploader.destroy(logoId)
            }

            const newLogo = await cloudinary.uploader.upload(req.body.logo, {
                folder:"logos",
                width:300,
                crop:"scale"
            })

            data.logo ={
                public_id:newLogo.public_id,
                url:newLogo.secure_url
            }
        
        }
        const updatedVendor = await Vendor.findByIdAndUpdate(vendor._id, data, {new:true, runValidator:true} )

        if (req.beforeUpdateVendorSelf){
            await VendorLogHistory.create({
                previousDetails: req.beforeUpdateVendorSelf,
                currentDetails:updatedVendor,
                timeStamp:Date.now(),
                updatedBy: req.user._id,
                action:req.method
            })
        }

       
       

        const notification= await Notification.create({
            title:"vendor profile",
            user:req.user._id,
            message:`${vendor.businessName} has updated their organization's profile `

        })

        const io = req.app.get('io');
        io.emit('new-notification', notification);
        //use the vendor id to update the vendor
        createSendResponse(updatedVendor , 200, res)   

    })

})

exports.getVendorSelf=asyncErrorHandler(async (req, res, next) =>{
    
    console.log('Fetching vendor for user:', req.user._id);

    const user = req.user
    const singleVendor=await Vendor.findOne({user:user._id}).populate({path:'user', populate:{path:'group'}}).populate('vendor_class', '-vendors')

     createSendResponse(singleVendor , 200, res)
})


exports.deleteVendor = asyncErrorHandler(async (req, res, next) => {
    await logUpdatedVendor(req, res, async () => {
    const binVendor = await Vendor.findByIdAndDelete(req.params.id)

    if (req.beforeUpdateVendor){
        await VendorLogHistory.create({
            previousDetails: req.beforeUpdateVendor,
            timeStamp:Date.now(),
            updatedBy: req.user._id,
            action:req.method
        })
    }

   

    if (!binVendor) {
        const error = new CustomError('vendor with this id is not found', 404)

        return next(error)
    }



    
    const notification =await Notification.create({
        title:"Vendor Notification",
        user:req.user._id,
        message:` The vendor, ${binVendor.businessName} has been deleted!`

    })

    const io = req.app.get('io');
    io.emit('new-notification', notification)

    createSendResponse(binVendor, 200, res);
})

})