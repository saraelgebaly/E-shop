const express = require("express");
const router = express.Router();
const productController = require("../controllers/product");
const allowAuthorization = require("../middlewares/verifyToken");

const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("File must be an image");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage: storage });
router.route("/").get(productController.getProducts);
router
  .route("/")
  .post(
    upload.single("image"),
   
    allowAuthorization,
    productController.addProduct
  );
router.route("/:id").get(productController.getProduct);
router
  .route("/:id")
  .patch(
    
    allowAuthorization,
    productController.updateProduct
  );
router
  .route("/:id")
  .delete(
   
    allowAuthorization,
    productController.deleteProduct
  );
router.route("/get/featured/:count").get(productController.getFeaturedCount);
router
  .route("/gallery-images/:id")
  .patch(
    upload.array("images", 20),
    
    allowAuthorization,
    productController.updateImagesGallery
  );
module.exports = router;
