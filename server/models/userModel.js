const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    firstname: String,
    lastname: String,
    birth: Date,
    gender: String,
    email: String,
    password: String,
    address: String,
    online: Boolean,
    avatar: {},
    conversations: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    groups: [
      {
        type: Schema.Types.ObjectId,
        ref: "group",
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "post",
      },
    ],
    saved: [
      {
        type: Schema.Types.ObjectId,
        ref: "post",
      },
    ],
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: "notification",
      },
    ],
    accept: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    request: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    register: Date,
    lastlogin: Date,
  },
  {
    collection: "user",
  }
);

UserSchema.index({ firstname: "text", lastname: "text", email: "text" });

module.exports = mongoose.model("user", UserSchema);
