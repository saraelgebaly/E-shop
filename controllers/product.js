const productModel = require("../models/product");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const { isValidObjectId, default: mongoose } = require("mongoose");
const categoryModel = require("../models/category");


const getProducts = asyncWrapper(async (req, res) => {
  let filter = {};
  if(req.query.categories)
{
    filter = {category: req.query.categories.split(',')}
} 

  const products = await productModel.find(filter).populate('category');
  if (!products) {
    const error = appError.create("Not found products",500);
    return next(error);
  }
  res.status(200).json({ message: "Got Successfully", products: products });
});
const addProduct = asyncWrapper(  async (req, res, next) => {
  if(req.user.role === 'Admin'){
    const category = await categoryModel.findById(req.body.category);
    if(!category){
      const error = appError.create('Invalid category',500)
      return next(error);
    }
    const file = req.file;
    if(!file){
      const error = appError.create('No image in the request',400)
      return next(error);
    }
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
  
    let product = new productModel({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });
    product = await product.save();
    
  
    res.status(201).json({ message: "Added Successfully", product: product });
  }
  else{
    const error = appError.create("You are not authorized", 403);
      return next(error);  
  }
});
const getProduct = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    const error = appError.create("Invalid ID", 500);
    return next(error);
  }
  const product = await productModel.findById({ _id: id }).populate('category');

  if (!product) {
    const error = appError.create("The Product cannot be found", 404);
    return next(error);
  }
  res.status(200).json({ message: "Got Successfully", product: product });
});
const updateProduct = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    const error = appError.create("Invalid ID", 500);
    return next(error);
  }
  if(req.user.role === 'Admin'){
    const category = await categoryModel.findById(req.body.category);
    if(!category){
      const error = appError.create('Invalid category',500)
      return next(error);
    }
    const product = await productModel.findByIdAndUpdate({ _id: id }, req.body,
       {new: true,})
   .populate('category');
    if (!product) {
      const error = appError.create("The Product cannot be found to update", 500);
      return next(error);
    }
  
    res.status(200).json({ message: "Updated Successfully", product: product });
  }
  else{
    const error = appError.create("You are not authorized", 403);
      return next(error);  
  }
});
const deleteProduct = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    const error = appError.create("Invalid ID", 500);
    return next(error);
  }
  if(req.user.role === 'Admin'){
    const product = await productModel.findByIdAndDelete({ _id: id });
  if (product) {
    res.status(200).json({ message: "deleted Successfully", product: null });
  } else {
    const error = appError.create("The Product cannot be found to delete", 500);
    return next(error);
  }
  } else{
    const error = appError.create("You are not authorized", 403);
      return next(error);  
  }
  
});
const getFeaturedCount = async (req, res, next)=>{
  const count = req.params.count ? req.params.count : 0;
  const products  = await productModel.find({isFeatured : true}).limit(+count)
if(!products){
  const error = appError.create("Failed to count", 500);
    return next(error);
}
 res.json({products: products})
}
const updateImagesGallery = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    const error = appError.create("Invalid ID", 500);
    return next(error);
  }
  if(req.user.role === 'admin') {
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    if(files){
      files.map(file =>{
        imagesPaths.push(`${basePath}${file.filename}`);
      })
    }
    const product = await productModel.findByIdAndUpdate(
      {_id:id},
      {
          images: imagesPaths
      },
      { new: true}
  )
  if(!product){
    const error = appError.create("the gallery cannot be updated!", 500);
      return next(error);
  }
  res.json({ product: product , message:"Updated successfully"})
  }else{
    const error = appError.create("You are not authorized", 403);
    return next(error);  
  }
  
})

module.exports = {
  getProducts,
  addProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getFeaturedCount,
  updateImagesGallery
};
