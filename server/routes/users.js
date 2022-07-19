const express = require("express");
const Router = express.Router();
const { verifyToken } = require("../middleware/auth");
const usersController = require("../controllers/userController");

Router.get("/user", verifyToken, usersController.GetUser);
Router.get("/user/:id", usersController.GetUserById);
Router.post("/register", usersController.Register);
Router.post("/login", usersController.Login);
Router.post("/forgot", usersController.ForGot);
Router.put("/reset", verifyToken, usersController.Reset);
Router.put("/changepassword", verifyToken, usersController.ChangePassword);
Router.put("/update", verifyToken, usersController.UpdateUser);
Router.put("/addfriend", verifyToken, usersController.AddFriend);
Router.put("/delfriend", verifyToken, usersController.DelFriend);
Router.put("/acceptfriend", verifyToken, usersController.AcceptFriend);
Router.put("/cancelfriend", verifyToken, usersController.CancelFriend);
Router.put("/denidefriend", verifyToken, usersController.DenideFriend);
Router.get("/search/:query", verifyToken, usersController.GetSearch);

module.exports = Router;
