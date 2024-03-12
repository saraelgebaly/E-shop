
const bodyParser=require('body-parser')

const express = require('express');
const cors = require('cors');
require('dotenv').config()

const app = express();
app.use(bodyParser.json())

const mongoose = require('mongoose');
const { message } = require('./utils/appError');
const url = process.env.url
mongoose.connect(url).then(()=>{
    console.log('connecting to MONGODB');
});  


app.use(cors());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

const productRouter = require('./routes/product') 
const categoryRouter = require('./routes/category') 
const userRouter = require('./routes/user')
const orderRouter = require('./routes/order')


app.use('/api/product', productRouter)
app.use('/api/category', categoryRouter)
app.use('/api/user', userRouter)
app.use('/api/order', orderRouter)
app.all('*',(req, res,next)=>{
    return res.status(404).json({message:'This resource is not available'})
})
app.use((error, req, res, next)=>{
res.status(error.statusCode||500).json({ message: error.message, statusCode: error.statusCode})
})


 


app.listen(4000,()=>{
console.log('listening on port 4000');
})