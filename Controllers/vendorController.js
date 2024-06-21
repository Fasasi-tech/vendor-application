const Vendor = require("../Models/vendorModel");
const CustomError = require("../utils/CustomError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const FilteringFeatures = require('../utils/filteringFeatures')
const jwt = require('jsonwebtoken')
const cloudinary = require('../utils/cloudinary');
const VendorLogHistory = require("../Models/vendorHistoryLog");
const Notification = require("../Models/notificationModel");
const {createSendResponse} = require('../utils/response')

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
    const {name, description, vendor_class, logo} = req.body

    const result = await cloudinary.uploader.upload(logo, {
        folder: "logos",
        width:300,
        crop:"scale"
    } )


    const user = req.user
    
    const existingVendor = await Vendor.findOne({ user: user._id });
    if (existingVendor) {
        return res.status(400).json({ error: 'User already has a vendor associated with them' });
    }

    const newVendor = {
        name,
        description,
        vendor_class,
        logo: {
            public_id:result.public_id,
            url:result.secure_url
        },
        user:user._id
    }

   
    const createVendors = await Vendor.create(newVendor)

    const notification= await Notification.create({
        title:"Create Vendor",
        user:req.user._id,
        message:`${req.user.email} has created their vendor account`

    })

    const io = req.app.get('io');

    io.emit('new-notification', notification);

    createSendResponse(createVendors, 200, res)
    
})

exports.getAllVendors = asyncErrorHandler(async (req, res, next) => {

    //const getAllVendors=await Vendor.find({}).populate('user')
    const features = new FilteringFeatures(Vendor.find({}).populate('user'), req.query)
                        .filter()
                        .sort()
                        .paginate()
                        .limitFields()

    const getAllVendors = await features.query
    createSendResponse(getAllVendors, 200, res)


})

exports.getVendorAndUpdate = asyncErrorHandler(async (req, res, next) => {

    await logUpdatedVendor(req, res, async () => {

        const getVendor = await Vendor.findById(req.params.id).populate('user')
        if(!getVendor){
           const error = new CustomError('vendor with this ID is not found', 404)
           return next(error)
        }
   
        const currentVendorLogo = await Vendor.findById(req.params.id)
   
   
        if(getVendor){
           getVendor.name= req.body.name || getVendor.name;
           getVendor.description = req.body.description || getVendor.description
           getVendor.vendor_class=req.body.vendor_class || getVendor.vendor_class
           
        }
   
        if (req.body.logo && req.body.logo !==''){
           const logoId = currentVendorLogo.logo?.public_id;
   
           if(logoId){
               await cloudinary.uploader.destroy(logoId)
           }
   
           const newLogo = await cloudinary.uploader.upload(req.body.logo, {
               folder:"logos",
               width:300,
               crop:"scale"
           })
   
           getVendor.logo = {
               public_id: newLogo.public_id,
               url:newLogo.secure_url
           }
        } else if (!req.body.logo) {
         // Keep existing logo if none is provided in the request   
           getVendor.logo = getVendor.logo;
       } else {
        // Clear the logo if an empty string is provided
           getVendor.logo = null; 
       }
      console.log(req.user._id)
   
        const updatedVendor = await getVendor.save()

        if (req.beforeUpdateVendor){
            await VendorLogHistory.create({
             // vendorId:req.params.id,
                previousDetails: req.beforeUpdateVendor,
                timeStamp: Date.now(),
                updatedBy: req.user._id
            })
        }

        const notification= await Notification.create({
            title:"vendor profile",
            user:req.user._id,
            message:`${req.user.email} updated a vendor's account `

        })

        const io = req.app.get('io');
        io.emit('new-notification', notification);
        //use the vendor id to update the vendor
      
    
        createSendResponse(updatedVendor , 200, res)
    })


})

exports.getSingleVendor=asyncErrorHandler(async (req, res, next) => {
    const singleVendor = await Vendor.findById(req.params.id).populate('user')
    if (!singleVendor){
        const error = new CustomError('vendor with this ID is not found', 404)
        return next(error)
    }
    createSendResponse(singleVendor, 200, res)
})

exports.getVendorSelfAndPatch = asyncErrorHandler(async (req, res, next) => {

    await logUpdatedVendorSelf( req, res, async () => {
        const {name, description, vendor_class} = req.body
        const vendor = await Vendor.findOne({user:req.user._id})
        if(!vendor){
            const error = new CustomError('vendor with this ID is not found', 404)
            return next(error)
        }

        const data ={
            name,
            description,
            vendor_class,
        
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
        if (req.beforeUpdateVendorSelf){
            await VendorLogHistory.create({
                previousDetails: req.beforeUpdateVendorSelf,
                timeStamp:Date.now(),
                updatedBy: req.user._id
            })
        }

       
        const updatedVendor = await Vendor.findByIdAndUpdate(vendor._id, data, {new:true, runValidator:true} )

        const notification= await Notification.create({
            title:"vendor profile",
            user:req.user._id,
            message:`${vendor.name} has updated their organization's profile `

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
    const singleVendor=await Vendor.findOne({user:user._id})
    console.log(singleVendor)
    if(!singleVendor){
        const error = new CustomError('vendor with this ID is not found', 404)
        return next(error)
     }

     createSendResponse(singleVendor , 200, res)
})


exports.deleteVendor = asyncErrorHandler(async (req, res, next) => {

    const binVendor = await Vendor.findByIdAndDelete(req.params.id)

    if (!binVendor) {
        const error = new CustomError('vendor with this id is not found', 404)

        return next(error)
    }

    
    const notification =await Notification.create({
        title:"Product Notification",
        user:req.user._id,
        message:` vendor with this name, ${binVendor.name} has been deleted!`

    })

    const io = req.app.get('io');
    io.emits('new-notification', notification)

    createSendResponse(binVendor, 200, res);
})