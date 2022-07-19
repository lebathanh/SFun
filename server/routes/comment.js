const express = require('express')
const Router = express.Router()
const CmtController = require('../controllers/commentController')

Router.post('/:id', CmtController.Comment)

module.exports = Router
