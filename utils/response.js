const jwt = require('jsonwebtoken')

const signToken = id => {
    return jwt.sign({id}, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES

})
}
exports.createSendResponseAuth = (user, statusCode, res ) =>{

    const token = signToken(user._id)

    
    const options={
        maxAge: process.env.LOGIN_EXPIRES,
        //it should be applied only on production mode 
        // secure:true,
        httpOnly:true
    }

    if (process.env.NODE_ENV ==='production'){
        options.secure = true
       
    }
    res.cookie('jwt', token, options)
    user.password= undefined

    res.status(statusCode).json({
        status:'success',
         token,
       
        data:{
            user
         }
       })

}

exports.createSendResponse = (user, statusCode, res) =>{
    if (!user && statusCode === 204) {
            return res.status(204).send(); // No Content     
        }
    res.status(statusCode).json({
        status:'success',
       
        data:{
            user
         }
       })
}