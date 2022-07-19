const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const userModel = require("../models/userModel");
const SECRET = process.env.SECRET;
const MAIL_SVR = process.env.MAIL_SVR;
const MAIL_SVR_PASS = process.env.MAIL_SVR_PASS;
const cloudinary = require("../config/cloudinary");

const UserModel = require("../models/userModel");
const GroupModel = require("../models/groupModel");

class UsersController {
  async GetUser(req, res, next) {
    try {
      const user = await UserModel.findOne({ _id: req.decode._id }).populate([
        {
          path: "groups",
          model: "group",
          populate: [
            {
              path: "admin",
              model: "user",
            },
            {
              path: "posts",
              model: "post",
              options: { sort: { time: -1 } },
              populate: [
                {
                  path: "author",
                  model: "user",
                },
                {
                  path: "comments",
                  model: "comment",
                  populate: {
                    path: "author",
                    model: "user",
                  },
                },
                {
                  path: "group",
                  model: "group",
                },
              ],
            },
            {
              path: "members",
              model: "user",
            },
          ],
        },
        {
          path: "posts",
          model: "post",
          options: { sort: { time: -1 } },
          populate: [
            {
              path: "group",
              model: "group",
            },
            {
              path: "author",
              model: "user",
            },
            {
              path: "comments",
              model: "comment",
              populate: [
                {
                  path: "author",
                  model: "user",
                },
              ],
            },
          ],
        },
        {
          path: "saved",
          model: "post",
          options: { sort: { time: -1 } },
          populate: [
            {
              path: "author",
              model: "user",
            },
            {
              path: "comments",
              model: "comment",
              populate: [
                {
                  path: "author",
                  model: "user",
                },
              ],
            },
          ],
        },
        {
          path: "friends",
          model: "user",
        },
        {
          path: "accept",
          model: "user",
        },
        {
          path: "notifications",
          options: { sort: { time: -1 } },
          populate: [
            {
              path: "author",
            },
            {
              path: "post",
              populate: [
                {
                  path: "group",
                },
              ],
            },
          ],
        },
      ]);
      return res.status(200).json({ success: true, code: 200, user });
    } catch (error) {
      next(error);
      res
        .status(500)
        .json({ success: false, code: 500, message: "Something went wrong" });
    }
  }

  async GetUserById(req, res, next) {
    try {
      const user = await UserModel.findOne({ _id: req.params.id }).populate({
        path: "posts",
        options: { sort: { time: -1 } },
        populate: [
          {
            path: "author",
            model: "user",
          },
          {
            path: "comments",
            model: "comment",
            populate: {
              path: "author",
              model: "user",
            },
          },
        ],
      });
      if (user) {
        return res.status(200).json({ success: true, code: 200, user });
      } else {
        return res
          .status(401)
          .json({ success: false, code: 401, message: "user-not-found" });
      }
    } catch (error) {
      next(error);
      res
        .status(500)
        .json({ success: false, code: 500, message: "Something went wrong" });
    }
  }

  async Login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!(email && password)) {
        return res
          .status(200)
          .json({ success: false, code: 401, message: "Bad request" });
      }

      const foundUser = await UserModel.findOne({ email });
      if (!foundUser) {
        return res
          .status(200)
          .json({ success: false, code: 403, message: "User not found" });
      } else if (bcrypt.compareSync(password, foundUser.password)) {
        const token = jwt.sign({ _id: foundUser._id }, SECRET, {
          expiresIn: "7d",
        });
        const refreshtoken = jwt.sign({ _id: foundUser._id }, SECRET, {
          expiresIn: "8d",
        });
        foundUser.lastlogin = Date.now();
        foundUser.save();
        return res.status(200).json({
          success: true,
          code: 200,
          message: "Login success",
          token,
          refreshtoken,
        });
      } else {
        return res
          .status(200)
          .json({ success: false, code: 400, message: "Incorrect password" });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, code: 500, message: "Server error" });
    }
  }

  async ChangePassword(req, res) {
    try {
      const foundUser = await UserModel.findById({ _id: req.decode._id });
      if (foundUser) {
        const password = req.body.password;
        const newPasswords = req.body.newPasswords;
        console.log(password, newPasswords);
        if (!(password && newPasswords)) {
          return res.json({
            success: false,
            code: 401,
            message: "Bad request",
          });
        } else {
          if (bcrypt.compareSync(password, foundUser.password)) {
            const salt = await bcrypt.genSalt(10);
            const passwordHashed = await bcrypt.hash(newPasswords, salt);
            foundUser.password = await passwordHashed;
            await foundUser.save();
            return res.status(200).json({
              success: true,
              status: 200,
              message: "Change successfully",
            });
          } else {
            return res.status(200).json({
              success: false,
              status: 201,
              message: "Password is incorrect",
            });
          }
        }
      } else {
        res
          .status(403)
          .json({ success: false, code: 403, message: "User not found" });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, code: 500, message: "Server error" });
    }
  }

  async UpdateUser(req, res) {
    const findUser = await userModel.findById({
      _id: req.decode._id,
    });
    if (findUser) {
      if (req.body.avatar) {
        if (findUser.avatar === null) {
          const imgResult = await cloudinary.uploader.upload(req.body.avatar);
          findUser.avatar = {
            imgUrl: imgResult.secure_url,
            cloudinary_id: imgResult.public_id,
          };
        } else {
          await cloudinary.uploader.destroy(findUser.avatar.cloudinary_id);
          const imgResult = await cloudinary.uploader.upload(req.body.avatar);
          findUser.avatar = {
            imgUrl: imgResult.secure_url,
            cloudinary_id: imgResult.public_id,
          };
        }
      }
      const birth = (await req.body.birth) || (await findUser.birth);
      findUser.firstname =
        (await req.body.firstname) || (await findUser.firstname);
      findUser.lastname =
        (await req.body.lastname) || (await findUser.lastname);
      findUser.gender = (await req.body.gender) || (await findUser.gender);
      findUser.address = (await req.body.address) || (await findUser.address);
      findUser.birth = (await new Date(birth)) || (await findUser.birth);
      await findUser.save();
      return res
        .status(200)
        .json({ success: true, code: 200, avatar: findUser.avatar });
    } else {
      res
        .status(500)
        .json({ success: false, code: 500, message: "Something went wrong" });
    }
  }

  async Register(req, res, next) {
    try {
      const { firstname, lastname, birth, gender, email, password, address } =
        req.body;
      if (
        !(
          firstname &&
          lastname &&
          birth &&
          gender &&
          email &&
          password &&
          address
        )
      ) {
        return res.send({
          success: false,
          status: 400,
          message: "some-input-is-required",
        });
      }
      const isUser = await UserModel.findOne({ email });
      if (isUser) {
        return res.send({
          success: false,
          status: 409,
          message: "user-already-exist",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const passwordHashed = await bcrypt.hash(password, salt);
        const user = new UserModel({
          firstname,
          lastname,
          birth,
          gender,
          email,
          password: passwordHashed,
          address,
          online: false,
          avatar: null,
          conversations: [],
          groups: [],
          posts: [],
          saved: [],
          friends: [],
          notifications: [],
          accept: [],
          request: [],
          register: Date.now(),
          lastlogin: Date.now(),
        });
        await user.save();
        res.status(201).json({
          success: true,
          status: 201,
          message: "Register succesfully",
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, status: 500, message: "Server error" });
    }
  }

  async ForGot(req, res, next) {
    const mailSrv = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: MAIL_SVR,
        pass: MAIL_SVR_PASS,
      },
    });
    const foundUser = await UserModel.findOne({
      email: req.body.email,
    });
    if (foundUser) {
      const token = jwt.sign({ _id: foundUser._id }, SECRET, {
        expiresIn: 604800 / 7 / 24,
      });
      const mailOpt = {
        from: MAIL_SVR,
        to: req.body.email,
        subject: "Sending Email using Node.js",
        html: `<h2>Welcome to BTech-Social Net, your reset password link: <a href="http://localhost:3000/auth/reset/${token}">Reset password</a></h2>`,
      };

      mailSrv.sendMail(mailOpt, function (error, info) {
        if (error) {
          res.json({ success: false, status: 500, message: error });
        } else {
          res.json({
            success: true,
            status: 201,
            message: "email-has-been-sent",
          });
        }
      });
    } else {
      res.json({ success: false, status: 400, message: "user-not-found" });
    }
  }

  async Reset(req, res, next) {
    try {
      const user = await UserModel.findById(req.decode._id);
      if (user) {
        const salt = await bcrypt.genSalt(10);
        const passwordHashed = await bcrypt.hash(req.body.password, salt);
        user.password = passwordHashed;
        user.save();
        return res.json({
          success: true,
          status: 201,
          message: "reset-success",
        });
      } else {
        return res.json({
          success: false,
          status: 401,
          message: "token-is-expired",
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async AddFriend(req, res) {
    try {
      const fromUser = await UserModel.findById(req.decode._id);
      const toUser = await userModel.findById(req.body.toUser);
      if (fromUser && toUser) {
        if (fromUser.accept.includes(toUser._id)) {
          const indexID = await fromUser.accept.indexOf(toUser._id);
          await fromUser.accept.splice(indexID, 1);
          if (!fromUser.friends.includes(toUser._id)) {
            await fromUser.friends.push(toUser._id);
          }
          if (toUser.request.includes(fromUser._id)) {
            const indexID = await toUser.request.indexOf(fromUser._id);
            await toUser.request.splice(indexID, 1);
          }
          if (!toUser.friends.includes(fromUser._id)) {
            await toUser.friends.push(fromUser._id);
          }
        } else {
          if (!fromUser.request.includes(toUser._id)) {
            await fromUser.request.push(toUser._id);
          }
          if (!toUser.accept.includes(fromUser._id)) {
            await toUser.accept.push(fromUser._id);
          }
        }
        await fromUser.save();
        await toUser.save();
        return res.status(200).json({
          success: true,
          code: 200,
          message: "Request friend successfully",
        });
      } else {
        res.status(401).json({
          success: false,
          code: 401,
          message: "Bad request, users does not exist",
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, code: 500, message: "Something went wrong" });
    }
  }

  async DelFriend(req, res) {
    try {
      const fromUser = await UserModel.findById(req.decode._id);
      const toUser = await userModel.findById(req.body.toUser);
      if (fromUser && toUser) {
        if (fromUser.friends.includes(toUser._id)) {
          const indexID = await fromUser.friends.indexOf(toUser._id);
          await fromUser.friends.splice(indexID, 1);
        }
        if (toUser.friends.includes(fromUser._id)) {
          const indexID = await toUser.friends.indexOf(fromUser._id);
          await toUser.friends.splice(indexID, 1);
        }
        await fromUser.save();
        await toUser.save();
        return res.status(200).json({
          success: true,
          code: 200,
          message: "Accept friend successfully",
        });
      } else {
        res.status(401).json({
          success: false,
          code: 401,
          message: "Bad request, users does not exist",
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, code: 500, message: "Something went wrong" });
    }
  }

  async AcceptFriend(req, res) {
    try {
      const fromUser = await UserModel.findById(req.decode._id);
      const toUser = await userModel.findById(req.body.toUser);
      if (fromUser && toUser) {
        if (fromUser.accept.includes(toUser._id)) {
          const indexID = await fromUser.accept.indexOf(toUser._id);
          await fromUser.accept.splice(indexID, 1);
          if (!fromUser.friends.includes(toUser._id)) {
            await fromUser.friends.push(toUser._id);
          }
        }
        if (toUser.request.includes(fromUser._id)) {
          const indexID = await toUser.request.indexOf(fromUser._id);
          await toUser.request.splice(indexID, 1);
          if (!toUser.friends.includes(fromUser._id)) {
            await toUser.friends.push(fromUser._id);
          }
        }
        await fromUser.save();
        await toUser.save();
        return res.status(200).json({
          success: true,
          code: 200,
          message: "Accept friend successfully",
        });
      } else {
        res.status(401).json({
          success: false,
          code: 401,
          message: "Bad request, users does not exist",
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, code: 500, message: "Something went wrong" });
    }
  }

  async DenideFriend(req, res) {
    try {
      const fromUser = await UserModel.findById(req.decode._id);
      const toUser = await userModel.findById(req.body.toUser);
      if (fromUser && toUser) {
        if (fromUser.accept.includes(toUser._id)) {
          const indexID = await fromUser.accept.indexOf(toUser._id);
          await fromUser.accept.splice(indexID, 1);
        }
        if (toUser.request.includes(fromUser._id)) {
          const indexID = await toUser.request.indexOf(fromUser._id);
          await toUser.request.splice(indexID, 1);
        }
        await fromUser.save();
        await toUser.save();
        return res.status(200).json({
          success: true,
          code: 200,
          message: "Denide friend successfully",
        });
      } else {
        res.status(401).json({
          success: false,
          code: 401,
          message: "Bad request, users does not exist",
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, code: 500, message: "Something went wrong" });
    }
  }

  async CancelFriend(req, res) {
    try {
      const fromUser = await UserModel.findById(req.decode._id);
      const toUser = await userModel.findById(req.body.toUser);
      if (fromUser && toUser) {
        if (fromUser.request.includes(toUser._id)) {
          const indexID = await fromUser.request.indexOf(toUser._id);
          fromUser.request.splice(indexID, 1);
        }
        if (toUser.accept.includes(fromUser._id)) {
          const indexID = await toUser.accept.indexOf(fromUser._id);
          toUser.accept.splice(indexID, 1);
        }
        await fromUser.save();
        await toUser.save();
        return res.status(200).json({
          success: true,
          code: 200,
          message: "Cancel friend successfully",
        });
      } else {
        res.status(401).json({
          success: false,
          code: 401,
          message: "Bad request, users does not exist",
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, code: 500, message: "Something went wrong" });
    }
  }

  async GetSearch(req, res) {
    const users = await UserModel.aggregate([
      {
        $addFields: {
          fullname: {
            $concat: ["$lastname", " ", "$firstname"],
          },
        },
      },
      {
        $match: {
          fullname: {
            $regex: req.params.query,
            $options: "i",
          },
        },
      },
    ]);
    const groups = await GroupModel.find({
      name: {
        $regex: req.params.query,
        $options: "i",
      },
    });
    res.status(200).json({
      items: [
        ...users.map((x) => ({ data: x, type: "user" })),
        ...groups.map((x) => ({ data: x, type: "group" })),
      ],
    });
  }
}

module.exports = new UsersController();
