const CustomError = require("../utils/CustomError");
const Customer = require("../Models/CustomerModel");
const { createSendResponse } = require("../utils/response");
const User = require("../Models/userModel");
const Notification = require("../Models/notificationModel");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const cloudinary = require('../utils/cloudinary');
const FilteringFeatures = require("../utils/filteringFeatures");

exports.createCustomer = asyncErrorHandler(async (req, res, next) =>{
    const {user, firstName, lastName, address, phoneNumber, image, gender, maritalStatus} = req.body

    if (!user ||!firstName ||!lastName ||!address ||!phoneNumber || !gender || !maritalStatus ){
        const error = new CustomError('This field is not populated correctly', 400)
        return next(error)
    }

    const { state, country} = address;

    if (!state ||!country){
        const error = new CustomError('This field is not populated correctly', 400)
        return next(error)
    }

    const result = await cloudinary.uploader.upload(image, {
        folder: "logos",
        width:300,
        crop:"scale"
    } )



    const data={
        user,
        firstName,
        lastName,
        address:{
            state,
            country
        },
        image:{
            public_id:result.public_id,
            url:result.secure_url
        }, 
        phoneNumber,
        gender,
        maritalStatus
    }

    const checkDb= await Customer.findOne({user})

    if (checkDb){
        const error= new CustomError('Customer exists in the database', 400)
        return next(error)
    }

    const createCustomer = await Customer.create(data)
    console.log(createCustomer, 'create')

    const users = await User.findOne({_id:req.user._id})

    const email = users.email

    const notification = await Notification.create({
        title: "create customer",
        user: req.user._id,
        message:`${email} has created a customer account`
    })

    const io = req.app.get('io')

    io.emit('new-notification', notification)

    createSendResponse(createCustomer, 201, res)   
})

exports.getAllCustomer = asyncErrorHandler(async (req, res, next) =>{
   // const Customers=await Customer.find({}).populate({path:'user', populate:{path:'group'}})
    const features = new FilteringFeatures(Customer.find({}).populate({path:'user', populate:{path:'group'}}), req.query).search().sort().paginate().limitFields()
    const Customers = await features.query
    const count = await Customer.find({})
    const result = count.length
    createSendResponse({Customers, result}, 200, res)
})

exports.getCustomerSelf= asyncErrorHandler(async (req, res, next) =>{
    console.log(req.user._id, 'req')
    const customer = await Customer.findOne({user:req.user._id}).populate({path:'user', populate:{path:'group'}}).populate({path:'user', populate:{path:'permissions'}})

    if (!customer) {
        return next(new CustomError('Customer not found', 404));
    }
    console.log(customer, 'customerst')
    createSendResponse(customer, 200, res)
})

exports.getCustomerById = asyncErrorHandler(async (req, res, next) =>{

    const findCustomer = await Customer.findById(req.params.id).populate({path:'user', populate:{path:'group'}}).populate({path:'user', populate:{path:'permissions'}})

    createSendResponse(findCustomer, 200, res)
})



exports.updateCustomerSelf = asyncErrorHandler(async (req, res, next) =>{
    const { firstName, lastName, address={}, phoneNumber, image, gender, maritalStatus} = req.body
    const { state, country} = address ;

    const customer= await Customer.findOne({user:req.user._id})

    if (!customer){
        const error = new CustomError('customer with this id is not found', 400)

        return next(error)
    }


   const data={
    firstName,
    lastName,
    address:{
        state: state || customer.address?.state, // Retain current state if not updating
        country: country || customer.address?.country, // Retain current country if not updating
    },
    phoneNumber,
    gender,
    maritalStatus
}

if (image && image !==''){
    const logoId = customer.image?.public_id;

    if(logoId){
        await cloudinary.uploader.destroy(logoId)
    }

    const newImage = await cloudinary.uploader.upload(image, {
        folder:"logos",
        width:300,
        crop:"scale"
    })

    data.image ={
        public_id:newImage.public_id,
        url:newImage.secure_url
    }

}
   
    const editCustomer=await Customer.findByIdAndUpdate(customer._id, data, {new:true, runValidator:true} )

    createSendResponse(editCustomer, 200, res)
})

exports.updateCustomerByAdmin = asyncErrorHandler( async (req, res, next) =>{
    const { firstName, lastName, address={}, phoneNumber, image, gender, maritalStatus} = req.body
    const { state, country} = address;

    const customer= await Customer.findById(req.params.id)

    console.log(customer, 'cust')

    if (!customer){
        const error = new CustomError('customer with this id is not found', 400)

        return next(error)
    }

    const data={
        firstName,
        lastName,
        address:{
            state: state || customer.address?.state, // Retain current state if not updating
            country: country || customer.address?.country, // Retain current country if not updating
        },
        phoneNumber,
        gender,
        maritalStatus
    }
    if (image && image !==''){
        const logoId = customer.image?.public_id;
    
        if(logoId){
            await cloudinary.uploader.destroy(logoId)
        }
    
        const newImage = await cloudinary.uploader.upload(image, {
            folder:"logos",
            width:300,
            crop:"scale"
        })
    
        data.image ={
            public_id:newImage.public_id,
            url:newImage.secure_url
        }
    }
    console.log(data, 'update')

    const updateCustomer=await Customer.findByIdAndUpdate(req.params.id, data, {new:true, runValidators:true} )
    
    createSendResponse(updateCustomer, 200, res)
})