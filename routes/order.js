const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order");
const allowAuthorization = require('../middlewares/verifyToken')

router.route("/").get(orderController.getOrders);
router.route("/").post(orderController.addOrder);
router.route("/:id").get(orderController.getOrder);
router.route("/:id").patch(orderController.updateOrder);
router.route("/:id").delete(orderController.deleteOrder);
router.route("/get/user-order/:userId").get(orderController.getUserOrders);
router.route("/get/total-sales").get(orderController.getTotalSales);

module.exports = router;
