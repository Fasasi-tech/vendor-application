const Notification = require('../Models/notificationModel')
const CustomError = require('../utils/CustomError')
const asyncErrorHandler = require('../utils/asyncErrorHandler')
const {createSendResponse} = require('../utils/response')
const cron = require('node-cron');


exports.getAllNotifications = asyncErrorHandler( async (req, res, next) =>{

    const notification = await Notification.find().sort({createdAt:-1})
    createSendResponse(notification, 200, res)

})


cron.schedule("0 0 0 * * *", async() => {
    const thirtyDaysAge = new Date(Date.now() - 30* 24 * 60 * 60 * 1000)
    await Notification.deleteMany({status:"read", createdAt: {$lt:thirtyDaysAge}})
})