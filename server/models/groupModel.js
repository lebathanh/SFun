const mongoose = require('mongoose')

const Schema = mongoose.Schema
const GroupSchema = new Schema(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    name: String,
    background: Object,
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'post',
      },
    ],
    created: Date,
  },
  {
    collection: 'group',
  }
)

module.exports = mongoose.model('group', GroupSchema)
