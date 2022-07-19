const mongoose = require('mongoose')

const Schema = mongoose.Schema
const CommentSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'post',
    },
    time: Date,
    text: String,
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
  },
  {
    collection: 'comment',
  }
)

module.exports = mongoose.model('comment', CommentSchema)
