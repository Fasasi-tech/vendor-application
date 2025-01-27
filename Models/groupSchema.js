const mongoose = require('mongoose')

const groupSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true, 'name is required']
    },
    permission:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'permission',
        required:[true, 'group permission is required']
    }]
})

const group = mongoose.model('group', groupSchema)

module.exports = group