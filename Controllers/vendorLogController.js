const asyncErrorHandler = require('../utils/asyncErrorHandler')
const FilteringFeatures = require('../utils/filteringFeatures')
const {createSendResponse} = require('../utils/response')
const PreviousVendorHistory = require('./../Models/vendorHistoryLog')

exports.getAllVendorHistory = asyncErrorHandler(async (req, res, next) =>{
    const pagination = new FilteringFeatures(PreviousVendorHistory.find().populate('updatedBy').sort({timestamps:-1}), req.query).search().sort().paginate().limitFields();
    const getAllVendorsHistory = await pagination.query
    const count = await PreviousVendorHistory.find()
    const result = count.length
    createSendResponse({getAllVendorsHistory, result}, 200, res)
})

exports.getvendorHistoryById = asyncErrorHandler(async (req, res, next) =>{
    const getSingleVendorsHistory = await PreviousVendorHistory.findById(req.params.id).populate({path:'updatedBy', select:"email -_id"}).sort({timeStamp:-1})
    createSendResponse(getSingleVendorsHistory, 200, res)
})