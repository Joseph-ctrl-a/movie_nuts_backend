const express = require('express')
module.exports = () => {
  const { loginUser, registerUser } = require('../controllers/auth/auth')

  const router = express.Router()
  router.post('/login', loginUser)
  router.post('/register', registerUser)
  return router
}
