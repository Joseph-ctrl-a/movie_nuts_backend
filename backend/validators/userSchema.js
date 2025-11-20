const { z } = require('zod')
const { filterFields } = require('../utils/filterFields')

const registerObject = {
  username: z
    .string()
    .min(4, { message: 'Username must be at least 4 characters long' })
    .max(20, { message: 'Username must not exceed 20 characters' })
    .regex(/^[A-Za-z0-9]+$/i, {
      message: 'Username may only contain letters and numbers',
    }),

  email: z.email({ message: 'Email must be a valid email address' }),

  password: z
    .string()
    .min(4, { message: 'Password must be at least 4 characters long' })
    .max(30, { message: 'Password must not exceed 30 characters' })
    .regex(/^\S+$/, {
      message: 'Password must not contain spaces',
    }),
}

const loginObject = filterFields(['email', 'password'], registerObject)

const registerSchema = z.object(registerObject)
const loginSchema = z.object(loginObject)

module.exports = { registerSchema, loginSchema }
