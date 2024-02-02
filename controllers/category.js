const categoryModel = require("../models/category");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const { isValidObjectId, default: mongoose } = require("mongoose");

const getCategories = asyncWrapper(async (req, res) => {
  const categories = await categoryModel.find();
  if (!categories) {
    const error = appError.create("Not found categories", 500);
    return next(error);
  }
  res.status(200).json({ message: "Got Successfully", categories: categories });
});
const addCategory = asyncWrapper(async (req, res, next) => {
  if (req.user.role === "Admin") {
    let category = new categoryModel({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    });
    category = await category.save();

    res.status(201).json({ message: "Added Successfully", category: category });
  } else {
    const error = appError.create("You are not authorized", 403);
    return next(error);
  }
});
const getCategory = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    const error = appError.create("Invalid ID", 500);
    return next(error);
  }
  const category = await categoryModel.findById({ _id: id });

  if (!category) {
    const error = appError.create("The category cannot be found", 404);
    return next(error);
  }
  res.status(200).json({ message: "Got Successfully", category: category });
});
const updateCategory = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    const error = appError.create("Invalid ID", 500);
    return next(error);
  }
  if (req.user.role === "Admin") {
    const category = await categoryModel.findByIdAndUpdate(
      { _id: id },
      req.body,
      { new: true }
    );
    if (!category) {
      const error = appError.create(
        "The category cannot be found to update",
        500
      );
      return next(error);
    }

    res
      .status(200)
      .json({ message: "Updated Successfully", category: category });
  } else {
    const error = appError.create("You are not authorized", 403);
    return next(error);
  }
});
const deleteCategory = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    const error = appError.create("Invalid ID", 500);
    return next(error);
  }
  if (req.user.role === "Admin") {
    const category = await categoryModel.findByIdAndDelete({ _id: id });
    if (category) {
      res.status(200).json({ message: "deleted Successfully", category: null });
    } else {
      const error = appError.create(
        "The category cannot be found to delete",
        500
      );
      return next(error);
    }
  } else {
    const error = appError.create("You are not authorized", 403);
    return next(error);
  }
});
module.exports = {
  getCategories,
  addCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
