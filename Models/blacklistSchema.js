const mongoose = require('mongoose')

const BlacklistSchema = new mongoose.Schema({
    token:{
        type:String,
        required: true,
        ref:"User"
    },
    
},
{timeStamps: true}
)

const blacklist=mongoose.model("blacklist", BlacklistSchema)
module.exports= blacklist