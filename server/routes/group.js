const express = require('express')
const Router = express.Router()
const { verifyToken } = require('../middleware/auth')
const GroupController = require('../controllers/groupController')

Router.get('/', GroupController.GetGroups)
Router.post('/', verifyToken, GroupController.Create)
Router.get('/:id', GroupController.GetGroup)
Router.put('/leave/:id', GroupController.LeaveGroup)
Router.put('/join', GroupController.JoinGroup)

module.exports = Router
