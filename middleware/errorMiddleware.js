const CustomError = require('../utils/CustomError')


const devError = (res, error)=>{
    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
        stackTrace:error.stack,
        error:error
        // in the dev environment we need to show all of the errors
     })
}

const castErrorHandler = (err) =>{
    const msg = `invalid value ${err.path}:${err.value}`
    //creating new instance of custom error class
    return new CustomError(msg, 400)
   }

   const duplicateErrorHandler = (err) =>{
    const msg = `duplicate email ${err.keyValue.name}. please use another email`
    return new CustomError(msg, 400)
}

const validatorErrorHandler= (err) =>{
    // we are getting an array of the object in the key-value pair
    const errors =Object.values(err.errors).map(val => val.message)
    // we are joining the array with dot and spaces
    const errorMessages = errors.join('. ')
    const msg = `invalid input data ${errorMessages}`
    return new CustomError(msg, 400)

}

const handleExpiredJWT = (err) =>{
    return new CustomError('Your session has expired. Please login again!', 401)
}

const handleJWTError = (err) =>{
    return new CustomError('Invalid token. Please login again', 401)
}
const prodError = (res, error) => {
    if (error.isOperational){
        res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
    })
    } else {
        res.status(500).json({
        status: 'error',
        message: 'something went wrong please try again later!',
    }) 
    }
    
}



module.exports = (error, req, res, next) =>{
    error.statusCode = error.statusCode ||500
    error.status = error.status || 'error';

    if (process.env.NODE_ENV ==='development'){
       devError(res, error)   
    } else if (process.env.NODE_ENV ==='production'){
        if (error.name ==='CastError'){
          error =  castErrorHandler(error) 
        }
        if (error.code === 11000){
            error=duplicateErrorHandler(error)
        }

      if (error.name === "ValidationError"){
        error = validatorErrorHandler(error)
      }
      //jsonwebtoken expired error
      if (error.name ==='TokenExpiredError'){
        error = handleExpiredJWT(error)
      }
      
      if (error.name ==='JsonWebTokenError'){
       error= handleJWTError(error)
      }
      prodError(res, error)
   
}}