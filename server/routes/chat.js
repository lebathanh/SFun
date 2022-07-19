const express = require("express");
const Router = express.Router();
const { verifyToken } = require("../middleware/auth");
const ChatController = require("../controllers/chatController");

Router.get("/conversation", verifyToken, ChatController.getConversation);
Router.get("/conversations", verifyToken, ChatController.getConversations);
Router.post("/send", verifyToken, ChatController.sendMessage);
Router.put("/seen", verifyToken, ChatController.seenMessage);

module.exports = Router;
