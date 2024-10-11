const Review = require('../Models/reviewSchema')
const customError = require('../utils/CustomError')
const asyncErrorHandler = require("../utils/asyncErrorHandler")
const { createSendResponse } = require('../utils/response')


exports.createReview= asyncErrorHandler(async (req, res, next) =>{

    if (!req.body.product) req.body.product= req.params.id
    if(!req.body.user) req.body.user = req.user._id

    const review=await Review.create(req.body)

    createSendResponse(review, 201, res)
})

exports.getReview= asyncErrorHandler(async (req, res, next) =>{
    
    // if (!req.body.product) req.body.product= req.params.id
    // if(!req.body.user) req.body.user = req.user._id

    const review=await Review.find()

    createSendResponse(review, 200, res)
})

exports.getReviewBasedOnId = asyncErrorHandler(async (req, res, next) =>{
    const getSingleReview=await Review.findById(req.params.id)

    createSendResponse(getSingleReview, 200, res)
})