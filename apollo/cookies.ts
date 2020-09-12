import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'

interface Options {
  expires: Date
  maxAge: number
}

/**
 * This sets `cookie` on `res` object
 */
const cookie = (res, name, value, options: Options) => {
  const stringValue = typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value)

  if ('maxAge' in options) {
    options.expires = new Date(Date.now() + options.maxAge)
    options.maxAge /= 1000
  }

  res.setHeader('Set-Cookie', serialize(name, String(stringValue), options))
}

/**
 * Adds `cookie` function on `res.cookie` to set cookies for response and parse the userId from the request cookies
 */
const cookies = (handler) => (req, res) => {
  const { token } = req.cookies
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET)
    // put the userId onto the req for future requests to access
    req.userId = userId
  }

  res.cookie = (name, value, options) => cookie(res, name, value, options)

  return handler(req, res)
}

export { cookies }
