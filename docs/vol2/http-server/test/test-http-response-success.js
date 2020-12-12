const assert = require('assert')

const Socket = require('./socket')
const handlerFactory = require('../http-response-success')

const REQUEST_HEADER = `GET @path HTTP/1.1

`.replace('\n', '\r\n')

const RESPONSE_HEADER = `HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 7

`.replace('\n', '\r\n')

describe('checks a constant HTTP response', () => { // eslint-disable-line
  it('constructs a handler and gets a response', async () => { // eslint-disable-line
    const socket = new Socket()
    const handler = handlerFactory(socket)
    const request = REQUEST_HEADER.replace('@path', '/')
    handler(request)
    const result = socket.text
    assert.strictEqual(result, RESPONSE_HEADER + 'SUCCESS',
      'Wrong response from server')
  })
})
