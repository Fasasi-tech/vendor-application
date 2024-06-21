const asyncErrorHandler = require('../utils/asyncErrorHandler')
const {createSendResponse} = require('../utils/response')
const PreviousVendorHistory = require('./../Models/vendorHistoryLog')

exports.getAllVendorHistory = asyncErrorHandler(async (req, res, next) =>{
    const getAllVendorsHistory = await PreviousVendorHistory.find().populate({path:'updatedBy', select:"email -_id"}).sort({timeStamp:-1})
    createSendResponse(getAllVendorsHistory, 200, res)
})