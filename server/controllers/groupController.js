const GroupModel = require('../models/groupModel')
const UserModel = require('../models/userModel')

class GroupController {
  async Create(req, res) {
    try {
      const foundUser = await UserModel.findById(req.decode._id)
      if (req.body.name && foundUser) {
        const group = new GroupModel({
          admin: foundUser._id,
          name: req.body.name,
          background: null,
          members: [foundUser._id],
          posts: [],
          created: new Date(),
        })
        await group.save()
        await foundUser.groups.push(group._id)
        await foundUser.save()
        return res.status(200).json({ success: true, code: 200, message: 'Create successfully', group })
      } else {
        return res.status(401).json({ success: false, code: 401, message: 'Bad request' })
      }
    } catch (error) {
      return res.status(500).json({ success: false, code: 500, message: 'Something went wrong' })
    }
  }

  async GetGroups(req, res) {
    try {
      const groups = await GroupModel.find()
      return res.status(200).json({ success: true, code: 200, message: 'Successfilly', groups })
    } catch (error) {
      return res.status(500).json({ success: false, code: 500, message: 'Something went wrong' })
    }
  }

  async GetGroup(req, res) {
    try {
      const group = await GroupModel.findById(req.params.id).populate([
        {
          path: 'admin',
          model: 'user',
        },
        {
          path: 'posts',
          model: 'post',
          options: { sort: { time: -1 } },
          populate: [
            {
              path: 'author',
              model: 'user',
            },
            {
              path: 'group',
              model: 'group',
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
          ],
        },
        {
          path: 'members',
          model: 'user',
        },
      ])
      if (group) {
        return res.status(200).json({ success: true, code: 200, message: 'Successfilly', group })
      } else {
        return res.status(401).json({ success: false, code: 401, message: 'Bad request' })
      }
    } catch (error) {
      return res.status(500).json({ success: false, code: 500, message: 'Something went wrong' })
    }
  }

  async LeaveGroup(req, res) {
    try {
      const group = await GroupModel.findById(req.params.id)
      const foundUser = await UserModel.findById(req.body.user)
      if (group && foundUser) {
        // Leave group
        if (foundUser.groups.includes(group._id)) {
          const indexID = await foundUser.groups.indexOf(group._id)
          if (indexID !== -1) {
            await foundUser.groups.splice(indexID, 1)
          }
        }
        if (group.members.includes(foundUser._id)) {
          const indexID = await group.members.indexOf(foundUser._id)
          if (indexID !== -1) {
            await group.members.splice(indexID, 1)
          }
        }
        // Save db
        await group.save()
        await foundUser.save()
        if (group.members.length <= 0) {
          await group.deleteOne()
        }
        return res.status(200).json({ success: true, code: 200, message: 'Leave Group' })
      } else {
        return res.status(401).json({ success: false, code: 401, message: 'Bad request' })
      }
    } catch (error) {
      return res.status(500).json({ success: false, code: 500, message: 'Something went wrong' })
    }
  }

  async JoinGroup(req, res) {
    try {
      const foundUser = await UserModel.findById(req.body.user)
      const foundGroup = await GroupModel.findById(req.body.group)
      if (foundUser && foundGroup) {
        if (!foundGroup.members.includes(foundUser._id)) {
          await foundGroup.members.push(foundUser._id)
          await foundGroup.save()
        }
        if (!foundUser.groups.includes(foundGroup._id)) {
          await foundUser.groups.push(foundGroup._id)
          await foundUser.save()
        }
        return res.status(200).json({ success: true, code: 200, message: 'Join Successfully', foundUser, foundGroup })
      } else {
        return res.status(401).json({ success: false, code: 401, message: 'Bad request' })
      }
    } catch (error) {
      return res.status(500).json({ success: false, code: 500, message: 'Something went wrong' })
    }
  }
}

module.exports = new GroupController()
