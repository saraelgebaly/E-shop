const userModel = require('../models/user');
const asyncWrapper = require('../middlewares/asyncWrapper')
const appError = require('../utils/appError');
const bcrypt = require('bcryptjs')
const jwb = require('sendwebtoken')
const generateJWT = require('../utils/generateJWT')

const getUsers = asyncWrapper(async (req, res) => {
    const users = await userModel.find().select('-password')
    res.send({message: "Got successfully", users: users})
})
const register = asyncWrapper( async (req, res , next) => {
    const {name, email, password, phone, role, street, apartment, zip, city,country} = req.body
    const oldUser = await userModel.findOne({ email})
    if(oldUser) {
        const error = appError.create("user already exists", 400)
        return next(error) 
    }
    const hashedPassword = await bcrypt.hash(password,10);

    const user =  new userModel({
        name: name,
        email: email,
        password: hashedPassword ,
        phone: phone,
        role: role,
        street: street,
        apartment: apartment,
        zip: zip,
        city: city, 
        country: country
    
    })
    
 
    const token = await generateJWT({ id: user._id, role:user.role})
    user.token = token;
   await user.save();
   if(!user){
    const error = appError.create("user cannot be created", 500)
        return next(error)
   }
    res.status(201).send({message:"User added successfully",user:user});
}
)
const login = asyncWrapper( async(req, res, next) => {
     const {email, password} = req.body
     if (!email || !password) {
        const error = appError.create("Email and password is required", 400)
        return next(error);
     }
     const user = await userModel.findOne({ email: email})
     if (!user) {
        const error = appError.create("User not found", 404)
        return next(error);
     }
     const matchedPassword = await bcrypt.compare(password, user.password)
     if(user && matchedPassword ){
        const token = await generateJWT({ id: user._id,role:user.role})
        return res.send({ data: {token}}); 

     }
     else{
        const error = appError.create('Email or Password is not correct', 500)
        return next(error);
     }

} ) 

const deleteUser = asyncWrapper (async (req, res)=>{
   if(req.user.role === 'Admin'){
    await userModel.deleteOne(req.params._id);
    res.send({message:'User deleted successully',data:null});
   }
   else{
    const error = appError.create("You are not authorized", 403);
      return next(error);  
   }
})



module.exports = {
    getUsers,
    register,
    login,
    deleteUser
}