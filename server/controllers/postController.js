const PostModel = require('../models/postModel')
const UserModel = require('../models/userModel')
const CommentModel = require('../models/commentModel')
const NotifiModel = require('../models/notificationModel')
const GroupModel = require('../models/groupModel')
const cloudinary = require('../config/cloudinary')

class PostController {
  async CreatePost(req, res) {
    try {
      const founduser = await UserModel.findById({
        _id: req.body.author,
      })
      if (founduser) {
        const post = new PostModel({
          author: founduser._id,
          time: Date.now(),
          cap: req.body.cap,
          notification: '',
          group: null,
          videos: [],
          images: [],
          likes: [],
          comments: [],
        })
        const images = req.body.images
        const videos = req.body.videos
        for (let i = 0; i < images.length; i++) {
          const imgResult = await cloudinary.uploader.upload(images[i])
          post.images.push({
            imgUrl: imgResult.secure_url,
            cloudinary_id: imgResult.public_id,
          })
        }
        for (let i = 0; i < videos.length; i++) {
          const videoResult = await cloudinary.uploader.upload(videos[i], {
            resource_type: 'video',
          })
          post.videos.push({
            videoUrl: videoResult.secure_url,
            cloudinary_id: videoResult.public_id,
          })
        }
        const notifi = new NotifiModel({
          author: founduser._id,
          type: 'post_notifi',
          post: post._id,
          time: post.time,
          receivers: founduser.friends,
        })
        if (req.body.group !== null) {
          const foundGr = await GroupModel.findById(req.body.group)
          if (foundGr) {
            post.group = foundGr._id
            await foundGr.posts.push(post._id)
            await foundGr.save()
            notifi.receivers = await foundGr.members
            notifi.type = 'group_notifi'
            if (notifi.receivers.includes(founduser._id)) {
              const indexID = await notifi.receivers.indexOf(founduser._id)
              await notifi.receivers.splice(indexID, 1)
            }
            post.group = foundGr
          } else {
            return res.status(401).json({ success: false, message: 'group-not-found' })
          }
        }
        post.notification = notifi._id
        founduser.posts.push(post._id)
        notifi.save()
        post.save()
        founduser.save()
        if (notifi.receivers.length !== 0) {
          for (let i = 0; i < notifi.receivers.length; i++) {
            const user = await UserModel.findById({ _id: notifi.receivers[i] })
            if (user) {
              user.notifications.push(notifi._id)
            }
            user.save()
          }
        }
        return res.status(200).json({ success: true, message: 'post-successfully', post, founduser })
      } else {
        return res.status(401).json({ success: false, message: 'user-not-found' })
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'server-error' })
    }
  }

  async GetPosts(req, res) {
    try {
      const foundUser = await UserModel.findById(req.decode._id)
      if (foundUser) {
        const perPage = 3
        const page = (await req.params.page) || 1
        const postsSize = await PostModel.find({
          group: {
            $in: [null, ...foundUser.groups],
          },
        })
          .countDocuments()
          .then((num) => Math.ceil(num / perPage))
        const posts = await PostModel.find({
          group: {
            $in: [null, ...foundUser.groups],
          },
        })
          .populate([
            { path: 'author' },
            { path: 'group' },
            {
              path: 'comments',
              populate: {
                path: 'author',
                model: 'user',
              },
            },
          ])
          .sort({ time: -1 })
          .skip(perPage * page - perPage)
          .limit(perPage)
        return res.status(200).json({ success: true, message: 'request-ok', posts, postsSize })
      } else {
        return res.status(400).json({ success: false, message: 'Bad request' })
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'server-error', error })
    }
  }

  async GetPost(req, res) {
    try {
      const post = await PostModel.findById({
        _id: req.params.id,
      }).populate([
        {
          path: 'author',
          model: 'user',
        },
        {
          path: 'comments',
          // options: { sort: { time: -1 } },
          populate: {
            path: 'author',
            model: 'user',
          },
        },
        {
          path: 'group',
          model: 'group',
        },
      ])
      if (post) {
        return res.status(200).json({ success: true, message: 'request-ok', post })
      } else {
        return res.status(404).json({ success: false, message: 'post-not-found' })
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'server-error', error })
    }
  }

  async DelPost(req, res) {
    try {
      const foundPost = await PostModel.findById({
        _id: req.params.id,
      })
      if (foundPost) {
        // xoa anh video
        for (let i = 0; i < foundPost.videos.length; i++) {
          await cloudinary.api.delete_resources(foundPost.videos[i].cloudinary_id, { resource_type: 'video' })
        }
        for (let i = 0; i < foundPost.images.length; i++) {
          await cloudinary.uploader.destroy(foundPost.images[i].cloudinary_id)
        }

        // xoa post trong user
        const foundUser = await UserModel.findById({
          _id: foundPost.author,
        })
        if (foundUser.posts.includes(foundPost._id)) {
          const indexID = await foundUser.posts.indexOf(foundPost._id)
          if (indexID !== -1) {
            await foundUser.posts.splice(indexID, 1)
          }
        }

        // xoa post trong group
        if (foundPost.group !== null) {
          const foundGroup = await GroupModel.findById(foundPost.group)
          if (foundGroup) {
            if (foundGroup.posts.includes(foundPost._id)) {
              const indexID = await foundGroup.posts.indexOf(foundPost._id)
              if (indexID !== -1) {
                await foundGroup.posts.splice(indexID, 1)
                await foundGroup.save()
              }
            }
          }
        }
        await foundUser.save()

        // xoa thong bao tren tat ca user
        const foundNotifi = await NotifiModel.findById(foundPost.notification)
        if (foundNotifi) {
          const foundRc = await UserModel.find({
            _id: {
              $in: [...foundNotifi.receivers],
            },
          })
          foundRc.forEach(async (element) => {
            if (element.notifications.includes(foundNotifi._id)) {
              const indexID = await element.notifications.indexOf(foundNotifi._id)
              if (indexID !== -1) {
                await element.notifications.splice(indexID, 1)
                await element.save()
              }
            }
          })
        }
        await NotifiModel.deleteOne({ _id: foundPost.notification })
        await CommentModel.deleteMany({ post: foundPost._id })

        await UserModel.find({ _id: { $ne: foundUser._id } }).then((allUser) => {
          allUser.forEach(async (element) => {
            if (element.saved.includes(foundPost._id)) {
              const indexID = await element.saved.indexOf(foundPost._id)
              if (indexID !== -1) {
                await element.saved.splice(indexID, 1)
                await element.save()
              }
            }
          })
        })

        await foundPost.deleteOne()
        return res.status(200).json({ success: true, message: 'delete-ok' })
      } else {
        return res.status(401).json({ success: false, message: 'id-does-not-exist' })
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'server-error', error })
    }
  }

  async LikePost(req, res) {
    try {
      const foundPost = await PostModel.findById({
        _id: req.params.id,
      })
      if (foundPost) {
        const foundUser = await UserModel.findById({
          _id: req.body.author,
        })
        if (foundUser) {
          const index = await foundPost.likes.indexOf(req.body.author)
          if (index > -1) {
            await foundPost.likes.splice(index, 1)
            await foundPost.save()
            return res.status(200).json({ success: true, message: 'dislike-ok' })
          } else {
            await foundPost.likes.push(req.body.author)
            await foundPost.save()
            return res.status(200).json({ success: true, message: 'like-ok' })
          }
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

  async SavePost(req, res) {
    try {
      const foundUser = await UserModel.findById(req.decode._id)
      if (foundUser) {
        if (!foundUser.saved.includes(req.params.id)) {
          await foundUser.saved.push(req.params.id)
          await foundUser.save()
        }
        const foundPost = await PostModel.findById(req.params.id).populate([
          {
            path: 'author',
            model: 'user',
          },
          {
            path: 'comments',
            model: 'comment',
            populate: [
              {
                path: 'author',
                model: 'user',
              },
            ],
          },
        ])
        return res.status(200).json({ success: true, code: 200, message: 'Saved successfully', post: foundPost })
      } else {
        return res.status(400).json({ success: false, code: 400, message: 'Bad request' })
      }
    } catch (error) {
      return res.status(500).json({ success: false, code: 500, message: 'Something went wrong' })
    }
  }

  async UnSavePost(req, res) {
    try {
      const foundUser = await UserModel.findById(req.decode._id)
      if (foundUser.saved.includes(req.params.id)) {
        const indexID = await foundUser.saved.indexOf(req.params.id)
        await foundUser.saved.splice(indexID, 1)
        await foundUser.save()
      }
      if (foundUser) {
        return res.status(200).json({ success: true, code: 200, message: 'Unsaved successfully', id: req.params.id })
      } else {
        return res.status(400).json({ success: false, code: 400, message: 'Bad request' })
      }
    } catch (error) {
      return res.status(500).json({ success: false, code: 500, message: 'Something went wrong' })
    }
  }
}

module.exports = new PostController()
