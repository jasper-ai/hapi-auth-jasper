import hapi from 'hapi'
import test from 'ava'
import nock from 'nock'
import basic from 'hapi-auth-basic'
import jwt from 'hapi-auth-jwt2'

import plugin from './index'

const server = new hapi.Server()
server.connection()

test('hapi-auth-jasper', (t) => {
  return new Promise((resolve) => {
    server.register([basic, jwt], (error) => {
      if (error) {
        t.fail(error.message)
        resolve()
        return
      }

      nock('http://iam-test.jasperdoes.xyz')
        .post('/authenticate')
        .reply(200, {
          payload: {
            token: 'sdaufpidufksjdf'
          }
        })

      server.register({
        register: plugin,
        options: {
          endpoint: 'http://iam-test.jasperdoes.xyz',
          iamUser: 'jasper-test@jasperdoes.xyz',
          iamPassword: 'jasper',
          secret: 'SECRET'
        }
      }, (error) => {
        if (error) t.fail(error.message)
        else t.pass('ok')

        resolve()
      })
    })
  })
})
