const response = require('../../operations/response')
const { auth } = require('../../auth/auth')

const controller = {}

controller.loginUser = async (req, res, next) => {
  try {
    // 1. Get Email And Password
    const { email, password } = auth
      .getUserInput(req)
      .validateInput('loginSchema')

    // 2. Find user
    const user = await auth.findUserByEmail(email)

    // 3. Verify Password
    await auth.passwordAuth(password, user.password)
    // 4. Generate JWT
    const token = auth.createJWT(user._id)

    // 4. Issue JWT in secure cookie
    return response.jwt({ res, token })
  } catch (err) {
    next(err)
  }
}

controller.registerUser = async (req, res, next) => {
  try {
    //  1. Get User Info (Username, Email, Password)
    const userInfo = auth.getUserInput(req).validateInput('registerSchema')

    // 2. Create User
    const user = await auth.createUser(userInfo)

    // 3. Generate JWT
    const token = auth.createJWT(user._id)

    // 4. Issue JWT in secure cookie
    return response.jwt({ res, token })
  } catch (err) {
    next(err)
  }
}
module.exports = controller
