const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name : {
        type:String,
        required:true
    },
   
    email :{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone : {
        type:String,
        required:true
    },
    token:{
        type:String
    },
    role: {
        type: String, 
        enum: ['Admin', 'User'],
        default: 'User'
    },
    street : {
        type:String,
        default:''
    },
    
    apartment : {
        type:String,
        default:''
    },
    zip : {
        type:String,
        default:''
    },
    city : {
        type:String,
        default:''
    },
    country : {
        type:String,
        default:''
    },


    
}
)
module.exports = mongoose.model('User', userSchema)
