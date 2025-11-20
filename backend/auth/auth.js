const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { UserModel } = require('../db/models/user/userModel')
const { loginSchema, registerSchema } = require('../validators/userSchema')
const HTTPError = require('../utils/error')

const auth = {}

auth.hashPassword = async (plainPassword, saltRounds = 10) =>
  await bcrypt.hash(plainPassword, saltRounds)

auth.verifyPassword = async (plainPassword, hashedPassword) =>
  await bcrypt.compare(plainPassword, hashedPassword)

auth.buildPayLoad = userId => ({
  sub: userId,
})

auth.createJWT = function (userId) {
  return jwt.sign(
    this.buildPayLoad(userId.toString()),
    process.env.SECRET_KEY,
    {
      expiresIn: '15m',
    },
  )
}

auth.findUserByEmail = async email => {
  const foundUser = await UserModel.findOne({ email })
  if (!foundUser) {
    throw new HTTPError.NotFoundError('User not found')
  }
  return foundUser
}
auth.getUserInput = req => {
  const userInput = req.body
  if (typeof userInput !== 'object') {
    throw new HTTPError.InvalidParamTypeError(
      'userObject',
      'object',
      typeof userInput,
    )
  }
  return {
    validateInput(schema) {
      if (typeof schema !== 'string')
        throw new HTTPError.InvalidParamTypeError(
          'schema',
          'string',
          typeof schema,
        )
      let result
      if (schema === 'loginSchema' || schema === 'login') {
        result = loginSchema.safeParse(userInput)
      } else if (schema === 'registerSchema' || schema === 'register') {
        result = registerSchema.safeParse(userInput)
      } else
        throw new HTTPError.DependencyError(
          'schema',
          `couldn't find a user schema called ${schema}`,
        )

      if (!result.success) {
        const allIssues = result.error.issues
          .map(issue => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ')

        throw new HTTPError.BadRequestError(allIssues)
      }
      return result.data
    },
  }
}

auth.passwordAuth = async (plainPassword, hashedPassword) => {
  const isPassword = await auth.verifyPassword(plainPassword, hashedPassword)
  if (!isPassword)
    throw new HTTPError.NotFoundError('Incorrect email or password')
  return isPassword
}

auth.createUser = async ({ username, email, password }) => {
  const hashedPassword = await auth.hashPassword(password)

  return UserModel.create({ username, email, password: hashedPassword })
}
module.exports = { auth }
