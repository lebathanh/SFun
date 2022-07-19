const UserModel = require('../models/userModel')

class NotifiController {
  async DelNotification(req, res) {
    try {
      const foundUser = await UserModel.findById(req.decode._id)
      if (foundUser) {
        if (foundUser.notifications.includes(req.body.notifi)) {
          const indexID = await foundUser.notifications.indexOf(req.body.notifi)
          await foundUser.notifications.splice(indexID, 1)
        }
        await foundUser.save()
        return res.status(200).json({ success: true, message: 'Delete successfully' })
      } else {
        return res.status(400).json({ success: false, message: 'Bad request' })
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Something went wrong' })
    }
  }
}

module.exports = new NotifiController()
