const Net = require('net')
const url = require('url')

class BaseHttpServer {
  constructor (port=BaseHttpServer.DEFAULT_PORT) {
    this.port = port
    this.server = new Net.Server()
  }

  run () {
    this.server.listen(this.port, () => {
      console.log(`server listening on localhost:${this.port}`)
    })
    this.server.on('connection', (socket) => {
      socket.on('data', this.handlerFactory(socket))
      socket.on('error', (err) => {
        console.log(`server error: ${err}`)
      })
    })
  }

  handlerFactory (socket) {
    return (data) => {
      const request = this.parseRequest(data.toString())
      const response = this.initializeResponse(request)
      this.handle(request, response)
      this.finalizeResponse(response)
      socket.write(response.header)
      if (response.body) {
        socket.write(response.body)
      }
    }
  }

  parseRequest (data) {
    const raw = data.toString().match(BaseHttpServer.TARGET_PATTERN)[1]
    return {
      url: new url.URL(raw, BaseHttpServer.DEFAULT_HOST)
    }
  }

  initializeResponse (request) {
    return {
      status_code: 200,
      status_message: 'OK',
      content_type: 'text/plain',
      length: null,
      header: null,
      body: null
    }
  }

  finalizeResponse (response) {
    response.length = response.body
      ? response.body.length
      : 0
    response.header = BaseHttpServer.HEADER
    for (const key of BaseHttpServer.KEYS) {
      response.header = response.header.replace(`@${key}`, response[key])
    }
  }

  handle (request, response) {
    response.body = `SUCCESS: ${request.url.pathname}`
  }
}

BaseHttpServer.DEFAULT_HOST = 'http://localhost'
BaseHttpServer.DEFAULT_PORT = 8080

BaseHttpServer.TARGET_PATTERN = /^GET\s+(.+)\s+HTTP\/1.1/

BaseHttpServer.KEYS = [
  'status_code',
  'status_message',
  'content_type',
  'length'
]

BaseHttpServer.HEADER = `HTTP/1.1 @status_code @status_message
Content-Type: @content_type
Content-Length: @length

`

module.exports = BaseHttpServer
