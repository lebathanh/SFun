const express = require('express')
const Router = express.Router()
const { verifyToken } = require('../middleware/auth')
const NotifiController = require('../controllers/notifiController')

Router.put('/delete', verifyToken, NotifiController.DelNotification)

module.exports = Router
