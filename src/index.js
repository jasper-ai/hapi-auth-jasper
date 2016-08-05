import pkg from '../package.json'
import { post } from 'highwire'

module.exports.register = (server, options, next) => {
  if (!options.endpoint) throw new Error('Jasper endpoint required!')

  const basic = (request, username, password, callback) => {
    post(`${options.endpoint}/auth/basic`, { username, password })
      .then((response) => response.body)
      .then(({ user, scope }) => callback(null, true, {
        user,
        scope,
        authType: 'basic'
      }))
      .catch((error) => callback(error, false))
  }

  const jwt = (decoded, request, callback) => {
    post(`${options.endpoint}/auth/jwt`, { cuid: decoded.cuid })
      .then((response) => response.body)
      .then(({ user, scope }) => callback(null, true, {
        user,
        scope,
        authType: 'jwt'
      }))
      .catch((error) => callback(error, false))
  }

  server.auth.strategy('basic', 'basic', { validateFunc: basic })
  server.auth.strategy('jwt', 'jwt', {
    key: options.key || 'SECRET',
    validateFunc: jwt,
    verifyOptions: { algorithms: ['HS256'] }
  })

  server.auth.default({ strategies: ['basic', 'jwt'] })

  next()
}

module.exports.register.attributes = {
  name: 'hapi-auth-jasper',
  version: pkg.version
}
