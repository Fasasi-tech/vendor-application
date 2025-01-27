const mongoose = require('mongoose')

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
      contentType: {
        type: String,
        required: true, // This could represent the type of resource (e.g., 'User', 'Product')
      },
     codename:{
      type:String,
      required:true
     }
})

const permission = mongoose.model('permission', permissionSchema)

module.exports = permission