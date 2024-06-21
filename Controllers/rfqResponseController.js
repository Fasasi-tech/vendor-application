const RfqResponse = require("../Models/rfqResponseSchema");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const { createSendResponse } = require("../utils/response");

exports.createRfqResponse= asyncErrorHandler( async(req, res, next) =>{

    const {amount, attachment, rfq } = req.body

    const rfqbody={
        amount,
        attachment,
        vendor:req.user._id,
        rfq
    }


    const rfqs = await RfqResponse.create(rfqbody)

    createSendResponse(rfqs, 200, res)
})