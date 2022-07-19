const CmtModel = require('../models/commentModel')
const PostModel = require('../models/postModel')
const UserModel = require('../models/userModel')

class CommentController {
  async Comment(req, res) {
    try {
      const foundPost = await PostModel.findById({
        _id: req.params.id,
      })
      if (foundPost) {
        const foundUser = await UserModel.findById({
          _id: req.body.author,
        })
        if (foundUser) {
          const comment = new CmtModel({
            author: foundUser._id,
            post: req.params.id,
            time: new Date(),
            text: req.body.text,
            likes: [],
          })
          await foundPost.comments.push(comment._id)
          await comment.save()
          await foundPost.save()
          return res.status(200).json({ success: true, message: 'commented', comment, user: foundUser })
        } else {
          return res.status(401).json({ success: false, message: 'user-not-found' })
        }
      } else {
        return res.status(401).json({ success: false, message: 'post-not-found' })
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'server-error', error })
    }
  }
}

module.exports = new CommentController()
