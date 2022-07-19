const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET

exports.verifyToken = function (req, res, next) {
  let token = req.headers['x-access-token'] || req.headers.authorization
  const checkWeffty = 'Bearer '
  if (token) {
    if (token.startsWith(checkWeffty)) {
      token = token.slice(checkWeffty.length, token.length)
    }
    try {
      const decoded = jwt.verify(token, SECRET)
      req.decode = decoded
      next()
    } catch (error) {
      res
        .status(401)
        .json({ status: 401, success: false, message: 'Invalid Token' })
    }
  } else {
    res.status(401).json({ status: 401, success: false, message: 'Unauthorized' })
  }
}
