const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ConversationSchema = new Schema(
  {
    isGroup: Boolean,
    members: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    newMess: [
      {
        type: Schema.Types.ObjectId,
        default: [],
      },
    ],
  },
  {
    collection: "conversation",
  }
);

module.exports = mongoose.model("conversation", ConversationSchema);
