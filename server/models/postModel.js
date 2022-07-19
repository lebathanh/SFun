const mongoose = require('mongoose')

const Schema = mongoose.Schema
const PostSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'group',
    },
    time: Date,
    cap: String,
    notification: {
      type: Schema.Types.ObjectId,
      ref: 'notification',
    },
    videos: Array,
    images: Array,
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'comment',
      },
    ],
  },
  {
    collection: 'post',
  }
)

module.exports = mongoose.model('post', PostSchema)
