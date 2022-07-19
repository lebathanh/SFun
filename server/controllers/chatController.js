const UserModel = require("../models/userModel");
const ConversationModel = require("../models/conversationModel");
const MessageModel = require("../models/messageModel");

class ChatController {
  async getConversation(req, res, next) {
    try {
      const foundUser = await UserModel.findOne({
        _id: req.decode._id,
      });
      const foundFriend = await UserModel.findOne({
        _id: req.body.friend,
      }).select(["firstname", "lastname", "online", "avatar"]);
      if (!foundUser || !foundFriend) {
        res.json({
          success: false,
          status: 401,
          message: "User or friend not found",
        });
      } else {
        const foundConver = await ConversationModel.findOne({
          members: { $all: [foundUser._id, foundFriend._id] },
        });
        if (!foundConver) {
          res.json({
            success: true,
            status: 200,
            element: null,
            friend: foundFriend,
          });
        } else {
          res.json({
            success: true,
            status: 200,
            element: foundConver,
            friend: foundFriend,
          });
        }
      }
    } catch (error) {
      res.json({
        success: false,
        status: 500,
        message: "server error",
      });
    }
  }

  async getConversations(req, res, next) {
    try {
      const foundUser = await UserModel.findOne({
        _id: req.decode._id,
      });
      if (!foundUser) {
        res.json({
          success: false,
          status: 401,
          message: "User not found",
        });
      } else {
        const foundConver = await ConversationModel.find({
          _id: { $in: foundUser.conversations },
        }).populate([
          {
            path: "members",
            model: "user",
            select: { firstname: 1, lastname: 1, online: 1, avatar: 1 },
          },
          {
            path: "messages",
            model: "message",
          },
        ]);
        res.json({
          success: true,
          status: 200,
          element: foundConver,
        });
      }
    } catch (error) {
      res.json({
        success: false,
        status: 500,
        message: "server error",
      });
    }
  }

  async sendMessage(req, res, next) {
    try {
      const foundUser = await UserModel.findOne({
        _id: req.decode._id,
      });
      const foundFriend = await UserModel.findOne({
        _id: req.body.friend,
      });
      if (!foundUser || !foundFriend) {
        res.json({
          success: false,
          status: 401,
          message: "User or friend not found",
        });
      } else {
        const foundConver = await ConversationModel.findOne({
          members: { $all: [foundUser._id, foundFriend._id] },
        });
        if (foundConver) {
          if (!foundUser.conversations.includes(foundConver._id)) {
            await foundUser.conversations.push(foundConver._id);
            await foundUser.save();
          }
          if (!foundFriend.conversations.includes(foundConver._id)) {
            await foundFriend.conversations.push(foundConver._id);
            await foundFriend.save();
          }
          const newMess = await new MessageModel({
            conversation: foundConver._id,
            author: foundUser._id,
            content: req.body.content,
          });
          await newMess.save();
          await foundConver.messages.push(newMess._id);
          if (!foundConver.newMess.includes(foundFriend._id)) {
            await foundConver.newMess.push(foundFriend._id);
          }
          await foundConver.save();
          res.json({
            success: true,
            status: 200,
            element: newMess,
          });
        } else {
          const newConver = await new ConversationModel({
            isGroup: false,
            members: [foundUser._id, foundFriend._id],
            messages: [],
          });

          await foundFriend.conversations.push(newConver._id);
          await foundUser.conversations.push(newConver._id);
          await foundFriend.save();
          await foundUser.save();

          const newMess = await new MessageModel({
            conversation: newConver._id,
            author: foundUser._id,
            content: req.body.content,
          });

          await newConver.messages.push(newMess._id);
          if (!newConver.newMess.includes(foundFriend._id)) {
            await newConver.newMess.push(foundFriend._id);
          }
          await newConver.save();

          const mess = await newMess.save();
          res.json({
            success: true,
            status: 200,
            element: mess,
          });
        }
      }
    } catch (error) {
      res.json({
        success: false,
        status: 500,
        message: "server error",
      });
    }
  }

  async seenMessage(req, res, next) {
    try {
      const foundConver = await ConversationModel.findOne({
        _id: req.body.conver,
      });
      if (foundConver) {
        if (foundConver.newMess.includes(req.body.user)) {
          await foundConver.newMess.splice(
            foundConver.newMess.indexOf(req.body.user),
            1
          );
          await foundConver.save();
          res.json({
            success: true,
            status: 200,
            element: foundConver,
          });
        } else {
          res.json({
            success: true,
            status: 200,
            element: foundConver,
          });
        }
      } else {
        res.json({
          success: true,
          status: 200,
          element: foundConver,
        });
      }
    } catch (error) {
      res.json({
        success: false,
        status: 500,
        message: "server error",
      });
    }
  }
}

module.exports = new ChatController();
