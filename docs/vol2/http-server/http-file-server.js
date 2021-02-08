import fs from 'fs'
import path from 'path'

import BaseHttpServer from './base-http-server.js'

class HttpFileServer extends BaseHttpServer {
  constructor (rootDir) {
    super()
    this.rootDir = path.resolve(rootDir)
  }

  handle (request, response) {
    let filePath = request.url.pathname
    if (filePath.startsWith('/')) {
      filePath = `./${filePath}`
    }
    if (filePath.endsWith('/')) {
      filePath = `${filePath}index.html`
    }
    filePath = path.resolve(filePath)
    if (!filePath.startsWith(this.rootDir)) {
      response.status_code = 403
      response.status_message = 'Forbidden'
      response.body = 'Requested file is out of bounds'
    } else if (!fs.existsSync(filePath)) {
      response.status_code = 404
      response.status_message = 'Not Found'
      response.body = 'Requested file does not exist'
    } else {
      response.body = fs.readFileSync(filePath, 'utf-8')
    }
  }
}

const server = new HttpFileServer(process.argv[2])
server.run()
