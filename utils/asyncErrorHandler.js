module.exports = (func) =>{
    return (req, res, next) => {
        func(req,res,next).catch(err => next(err))
        // we are only expecting an async function//next(err) means calling the error handling middleware
    }
   }