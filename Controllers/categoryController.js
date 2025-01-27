
const Category = require('../Models/categoryModel')
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const {createSendResponse} = require('../utils/response')

exports.category = asyncErrorHandler (async (req, res, next) =>{
    const {name} = req.body

    const createCategory ={
        name
    }

    const category = await Category.create(createCategory)

    createSendResponse(category, 201, res)
})

exports.getCategories = asyncErrorHandler (async (req, res, next) =>{
    
    const category = await Category.find()

    createSendResponse(category, 200, res)
})

exports.getSingleCategory = asyncErrorHandler (async (req, res, next) =>{
     const category = await Category.findById(req.params.id)

     createSendResponse(category, 200, res)
})

exports.getSingleCategoryAndUpdate = asyncErrorHandler(async (req, res, next) =>{
    const {name} = req.body;

     const updateCategory = await Category.findByIdAndUpdate(req.params.id, name, {new:true, runValidator:true}, {timestamps:true} )

     createSendResponse(updateCategory, 200, res)
})

exports.categoryAggregate = asyncErrorHandler(async (req, res, next) =>{
    const categoryAgg = await Category.aggregate([
        {$group:{
            _id:"$name",
            count:{$sum:1}
            }
        }
    ])

    createSendResponse(categoryAgg, 200, res)
})