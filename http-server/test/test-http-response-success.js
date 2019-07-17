const assert = require('assert')

const Socket = require('./socket')
const handlerFactory = require('../http-response-success')

const Request_Header = `GET @path HTTP/1.1

`.replace('\n', '\r\n')

const Response_Header = `HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 7

`.replace('\n', '\r\n')

describe('checks a constant HTTP response', () => {
  it('constructs a handler and gets a response', async () => {
    const socket = new Socket()
    const handler = handlerFactory(socket)
    const request = Request_Header.replace('@path', '/')
    handler(request)
    const result = socket.text
    assert.equal(result, Response_Header + 'SUCCESS',
                 `Wrong response from server`)
  })
})
