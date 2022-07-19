const express = require('express')
const Router = express.Router()
const { verifyToken } = require('../middleware/auth')
const PostController = require('../controllers/postController')

Router.get('/page/:page', verifyToken, PostController.GetPosts)
Router.post('/', PostController.CreatePost)
Router.get('/:id', PostController.GetPost)
Router.put('/like/:id', PostController.LikePost)
Router.delete('/:id', PostController.DelPost)
Router.put('/save/:id', verifyToken, PostController.SavePost)
Router.put('/unsave/:id', verifyToken, PostController.UnSavePost)

module.exports = Router
