const express = require('express');
const router = express.Router()
const userController = require('../controllers/user');
const allowAuthorization = require('../middlewares/verifyToken');

    router.route("/").get(userController.getUsers)
    router.route("/register").post(userController.register)
    router.route("/login").post(userController.login)
    router.route("/:id").delete(allowAuthorization,userController.deleteUser)






module.exports = router
 