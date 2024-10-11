const asyncErrorHandler = require('../utils/asyncErrorHandler')
const FilteringFeatures = require('../utils/filteringFeatures')
const { createSendResponse } = require('../utils/response')
// const { default: ProductHistoryLog } = require('./../Models/productHistoryLogSchema')
const ProductHistoryLog = require('./../Models/productHistoryLogSchema')

exports.getProductHistoryById = asyncErrorHandler( async (req, res, next) =>{

    const productId = req.params.id
    const productHistoryLog = await ProductHistoryLog.findById(productId)
    createSendResponse(productHistoryLog, 200, res)
})

exports.getAllProductHistory = asyncErrorHandler(async (req, res, next) =>{
    // const getAllProductHistory = await ProductHistoryLog.find().sort({timeStamp:-1})
    const pagination= new FilteringFeatures(ProductHistoryLog.find().sort({timeStamp:-1}), req.query).search().sort().paginate().limitFields();
    const getAllProductHistory = await pagination.query
    const count = await ProductHistoryLog.find()
    const result= count.length


    createSendResponse({getAllProductHistory, result}, 200, res)
})