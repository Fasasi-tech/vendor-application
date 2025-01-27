const Notification = require('../Models/notificationModel')
const CustomError = require('../utils/CustomError')
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const FilteringFeatures = require('../utils/filteringFeatures');
const {createSendResponse} = require('../utils/response')
const cron = require('node-cron');


exports.getAllNotifications = asyncErrorHandler( async (req, res, next) =>{

    const features = new FilteringFeatures(Notification.find().populate('user'), req.query).search().sort().paginate().limitFields()
    const notifications = await  features.query
    const count = await Notification.find({})
    const result = count.length
    createSendResponse({notifications, result}, 200, res)

})

exports.topFiveNotifications = asyncErrorHandler( async (req, res, next) =>{

   const results= await Notification.find().sort({ createdAt: -1 }).limit(5);

    createSendResponse(results, 200, res)
})



cron.schedule("0/10 * * * * *", async() => {
    const thirtyDaysAge = new Date(Date.now() - 30* 24 * 60 * 60 * 1000)
    await Notification.deleteMany({ createdAt: {$lt:thirtyDaysAge}})
    
})