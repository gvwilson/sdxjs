import BaseHttpServer from './base-http-server.js'

class HttpParamsServer extends BaseHttpServer {
  constructor () {
    super()
    this.messages = new Map([
      ['low', 'LOW'],
      ['moderate', 'MODERATE'],
      ['high', 'HIGH']
    ])
  }

  handle (request, response) {
    const level = request.url.searchParams.get('level') || 'low'
    const message = this.messages.get(level) || `unknown level: ${level}`
    response.body = message
  }
}

const server = new HttpParamsServer()
server.run()
