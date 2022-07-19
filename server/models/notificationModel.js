const mongoose = require('mongoose')

const Schema = mongoose.Schema
const NotificationSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    type: String,
    post: {
      type: Schema.Types.ObjectId,
      ref: 'post',
    },
    time: Date,
    receivers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
  },
  {
    collection: 'notification',
  }
)

module.exports = mongoose.model('notification', NotificationSchema)
