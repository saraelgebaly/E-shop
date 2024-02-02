const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category");
const allowAuthorization = require('../middlewares/verifyToken')

router.route("/").get(categoryController.getCategories);
router.route("/").post(allowAuthorization,categoryController.addCategory);
router.route("/:id").get(categoryController.getCategory);
router.route("/:id").patch(allowAuthorization,categoryController.updateCategory);
router.route("/:id").delete(allowAuthorization,categoryController.deleteCategory);

module.exports = router;
