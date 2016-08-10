import pkg from '../package.json'
import { post } from 'highwire'

module.exports.register = (server, {
  endpoint: endpoint,
  iamUser: iamUser,
  iamPassword: iamPassword,
  secret: secret
}: Object, next) => {
  if (!endpoint || !iamUser || !iamPassword || !secret) {
    throw new Error('Missing Env Vars! One of: IAM_ENDPOINT, IAM_USERNAME, IAM_PASSWORD, IAM_SECRET')
  }

  post(`${endpoint}/authenticate`, {
    email: iamUser,
    password: iamPassword
  }).then(response => response.body)
    .then(response => {
      const headers = { authorization: response.payload.token }

      const basic = (
        request: Object,
        username: string,
        password: string,
        callback: Function
      ): undefined => {
        post(`${endpoint}/auth/basic`, { username, password }, { headers })
          .then((response) => response.body)
          .then(({ user, scope }) =>
            callback(null, true, { user, scope, authType: 'basic' }))
          .catch((error) => callback(error, false))
      }

      const jwt = (
        decoded: Object,
        request: Object,
        callback: Function
      ): undefined => {
        post(`${endpoint}/auth/jwt`, { cuid: decoded.cuid }, { headers })
          .then((response) => response.body)
          .then(({ user, scope }) =>
            callback(null, true, { user, scope, authType: 'jwt' }))
          .catch(error => callback(error, false))
      }

      server.auth.strategy('basic', 'basic', { validateFunc: basic })
      server.auth.strategy('jwt', 'jwt', {
        key: secret,
        validateFunc: jwt,
        verifyOptions: { algorithms: ['HS256'] }
      })

      server.auth.default({ strategies: ['basic', 'jwt'] })

      next()
    }).catch(error => next(error))
}

module.exports.register.attributes = {
  name: 'hapi-auth-jasper',
  version: pkg.version
}
