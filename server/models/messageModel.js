const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const MessageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "message",
  }
);

module.exports = mongoose.model("message", MessageSchema);
