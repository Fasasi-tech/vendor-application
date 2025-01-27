const mongoose = require('mongoose')
const Vendor = require("../Models/vendorModel");
const categorySchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    vendors:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Vendor'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }

})

categorySchema.pre('remove', async function(next){
    Vendor.updateMany({vendor_class:this._id},
        {$pull:{vendor_class:this._id}}
    )
    next()
})

const category = mongoose.model('category', categorySchema)

module.exports = category