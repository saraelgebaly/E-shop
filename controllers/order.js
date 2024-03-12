const orderModel = require("../models/order");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const { isValidObjectId, default: mongoose } = require("mongoose");
const orderItemModel = require("../models/orderItem");
 
const getOrders = asyncWrapper(async (req, res,next) => {
  const orders = await orderModel.find().populate('user', 'name').sort({'dateOrdered':-1});
  if (!orders) {
    const error = appError.create("Not found Orders",500);
    return next(error);
  }
  res.status(200).send({ message: "Got Successfully", orders: orders });
});
const addOrder = asyncWrapper(async (req, res, next) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new orderItemModel({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  const orderItemIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(orderItemIdsResolved.map(async(orderItemId)=>{
  const orderItem = await orderItemModel.findById(orderItemId).populate('product','price');

  const totalPrice = orderItem.product.price * orderItem.quantity;
  return totalPrice; 
  }))
  const totalPrice =  totalPrices.reduce((a , b) => a + b , 0)
  let order = new orderModel({
    orderItems: orderItemIdsResolved,
    shippingAddress1: req.body.shippingAddress1, 
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();

  res.status(201).send({ message: "Added Successfully", order: order });
});
const getOrder = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    const error = appError.create("Invalid ID", 500);
    return next(error);
  }
  const order = await orderModel.findById({ _id: id }).populate('user', 'name')
  .populate({path:'orderItems',populate:{path:'product',populate:'category'}});

  if (!order) {
    const error = appError.create("The Order cannot be found", 404);
    return next(error);
  }
  res.status(200).send({ message: "Got Successfully", order: order });
});
const updateOrder = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    const error = appError.create("Invalid ID", 500);
    return next(error);
  }
  
  const order = await orderModel.findByIdAndUpdate({ _id: id }, {status:req.body.status,user:req.body.user},
     {new: true,})
     if (!order) {
      const error = appError.create("The Order cannot be Updated", 500);
      return next(error);
    }

  res.status(200).send({ message: "Updated Successfully", order: order });
});
const deleteOrder = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    const error = appError.create("Invalid ID", 500);
    return next(error);
  }
  const order = await orderModel.findByIdAndDelete({ _id: id });
  if (order) {
    res.status(200).send({ message: "deleted Successfully", order: null });
  } else {
    const error = appError.create("The Order cannot be found to delete", 500);
    return next(error);
  }
});
const getUserOrders = asyncWrapper( async (req, res, next) =>{
  
  const userOrders= await orderModel.find({user: req.params.userId}).populate({ 
      path: 'orderItems', populate: {
          path : 'product', populate: 'category'} 
      }).sort({'dateOrdered': -1});
  if(!userOrders) {
    const error  = appError.create('Cannot get user orders', 404)
    return next(error)
  } 
  res.send({userOrders: userOrders})
});
const getTotalSales = asyncWrapper (async (req, res, next) => {
  const totalSales = await orderModel.aggregate([
    {$group : {_id: null , totalSales: {$sum : '$totalPrice'}}}
  ]);
  if(!totalSales){
    const error = appError.create("The order sales cannot be generated", 400);
    return next(error);
  }
  res.send({message:'Got Successfully' ,totalSales: totalSales.pop().totalSales})
})
module.exports = {
  getOrders,
  addOrder,
  getOrder,
  updateOrder, 
  deleteOrder,
  getUserOrders,
  getTotalSales
}