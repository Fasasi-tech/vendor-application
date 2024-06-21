const asyncErrorHandler = require('../utils/asyncErrorHandler')
const { createSendResponse } = require('../utils/response')
// const { default: ProductHistoryLog } = require('./../Models/productHistoryLogSchema')
const ProductHistoryLog = require('./../Models/productHistoryLogSchema')

exports.getProductHistoryById = asyncErrorHandler( async (req, res, next) =>{

    const productId = req.params.id
    const productHistoryLog = await ProductHistoryLog.find({productId}).sort({timeStamp:-1})
    createSendResponse(productHistoryLog, 200, res)
})

exports.getAllProductHistory = asyncErrorHandler(async (req, res, next) =>{
    const getAllProductHistory = await ProductHistoryLog.find().sort({timeStamp:-1})
    createSendResponse(getAllProductHistory, 200, res)
})