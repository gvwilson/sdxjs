const url = require('url')

const BaseHttpServer = require('./base-http-server')

class HttpJsonServer extends BaseHttpServer {
  parseRequest (data) {
    data = data.toString()
    const { body } = this.getHeadAndBody(data)
    const [verb, raw, headers] = this.parseHead(data)
    return {
      url: new url.URL(raw, BaseHttpServer.DEFAULT_HOST),
      verb: verb,
      headers: headers,
      body: this.convertBody(headers, body)
    }
  }

  getHeadAndBody (data) {
    const separators = ['\r\n\r\n', '\n\n']
    for (const sep of separators) {
      const loc = data.indexOf(sep)
      if (loc >= 0) {
        const head = data.slice(0, loc)
        const body = data.slice(loc + sep.length)
        return { head, body }
      }
    }
    return ''
  }

  parseHead (head) {
    const lines = head.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
    const parts = lines[0].match(HttpJsonServer.TARGET_PATTERN)
    const verb = parts[1]
    const raw = parts[2]
    const headers = lines.slice(1).reduce((soFar, line) => {
      const match = line.match(/^\s*(.+?)\s*:\s*(.+)\s*$/)
      const key = match[1].toLowerCase()
      const value = match[2]
      if (!soFar.has(key)) {
        soFar.set(key, [])
      }
      soFar.get(key).push(value)
      return soFar
    }, new Map())
    return [verb, raw, headers]
  }

  convertBody (headers, body) {
    if (headers.get('content-type').includes('application/json')) {
      body = JSON.parse(body)
    }
    return body
  }

  handle (request, response) {
    const value = request.body.key
    response.body = JSON.stringify({ result: value })
  }
}

HttpJsonServer.TARGET_PATTERN = /^(.+?)\s+(.+)\s+HTTP\/1.1/

const server = new HttpJsonServer()
server.run()
