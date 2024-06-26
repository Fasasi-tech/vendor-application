const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const express = require('express');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const http = require('http')
const sanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const authRouter = require('./Routes/authRoutes')
const userRoute = require('./Routes/userRoute')
const vendorRoute = require('./Routes/vendorRoutes')
const notificationRoute = require('./Routes/notificationRoutes')
const productRoute = require('./Routes/productRoutes')
const productLogRoute = require('./Routes/productLogRoutes')
const rfqRoute=require('./Routes/rfqRoutes')
//const analyticsRoute = require('./Routes/analyticsRoutes')
const customError = require('./utils/CustomError')
const initSocketServer = require('./socketServer')
const globalErrorHandler = require('./middleware/errorMiddleware')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');


process.on('unCaughtException', (err) => {
    console.log(err.name, err.message)
    console.log('unhandled rejection occured! shutting down ...')
        process.exit(1)
   
})

const app = express();


const server = http.createServer(app)
// Allow requests from localhost:3000



const io=initSocketServer(server);
app.set('io', io); // Make io available globally via app
const cors= require('cors')

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
    origin: function(origin, callback) {
        // Check if the request origin is in the allowedOrigins array
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));


// setting security http header to prevent denial of service attack
app.use(helmet());
//implementing rate limiting to prevent brute force attack
let limiter = rateLimit({
    max:1000,
    windowMs:60*60*1000,
    message:'We have received too many requests from this IP. Please try again after one hour'
})

app.use('/api', limiter)
app.use(express.json({limit:'10kb'}));

//data sanitization
app.use(sanitize())
app.use(xss())

mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser:true
}).then((conn) => { 
    console.log(conn);
    console.log('DB Connection Successful')
})

app.use('/api/v1/auth', authRouter )
app.use('/api/v1/users',userRoute )
app.use('/api/v1/vendors',vendorRoute )
app.use("/api/v1/product", productRoute)
app.use("/api/v1/productLog", productLogRoute )
app.use('/api/v1/rfq', rfqRoute)
app.use('/api/v1/notifications', notificationRoute)

app.all('*', (req,res, next) => {
    const err = new customError(`can't find ${req.originalUrl} on the server!`, 404)
    next(err)
})

app.use(globalErrorHandler)

const port = 8000; 
server.listen(port, ()=> console.log(`Server is running on port ${port}`))


process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message)
    console.log('unhandled rejection occured! shutting down ...')
    server.close(() => {
        process.exit(1)
    })
   
})

//module.exports = app