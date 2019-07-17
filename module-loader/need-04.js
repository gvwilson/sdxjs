const fs = require('fs')
const path = require('path')

class Cache {
  constructor () {
    this.loaded = new Map()
    this.constructSearchPath()
  }

  need (callerFilename, fileSpec) {
    if (this.loaded.has(fileSpec)) {
      return this.loaded.get(fileSpec)
    }
    const [filePath, fileDir] = this.find(callerFilename, fileSpec)
    const content = fs.readFileSync(filePath, 'utf-8')
    const interpolated = this.interpolate(fileDir, content)
    const result = eval(interpolated)
    this.loaded.set(fileSpec, result)
    return result
  }

  constructSearchPath () {
    this.searchPath = []
    if ('NEED_PATH' in process.env) {
      this.searchPath = process.env.NEED_PATH.split(':').filter(x => x.length > 0)
    }
  }

  find (callerFilename, fileSpec) {
    let filePath = undefined,
        fileDir = undefined
    if (fileSpec.startsWith('.')) {
      fileDir = callerFilename.split('/').slice(0, -1).join('/')
      fileDir = (fileDir === '')
        ? '.'
        : path.normalize(fileDir)
      filePath = path.join(fileDir, fileSpec)
      fileDir = path.dirname(filePath)
      if (!fs.existsSync(filePath)) {
        filePath = undefined
        fileDir = undefined
      }
    }
    else {
      for (let dir of this.searchPath) {
        const filePath = path.join(dir, fileSpec)
        if (fs.existsSync(filePath)) {
          filePath = filePath
          fileDir = dir
          break
        }
      }
    }
    if (filePath === undefined) {
      throw new Error(`unable to import ${fileSpec}: no match found`)
    }
    return [filePath, fileDir]
  }

  interpolate (fileDir, outer) {
    return outer.replace(Cache.INTERPOLATE_PAT, (match, comment, filename) => {
      filename = filename.trim()
      const filePath = path.join(fileDir, filename)
      if (!fs.existsSync(filePath)) {
        throw new Error(`Cannot find ${filePath}`)
      }
      const inner = fs.readFileSync(filePath, 'utf-8')
      return inner
    })
  }
}
Cache.INTERPOLATE_PAT = /\/\*\+(.+?)\+(.+?)\+\*\//g

const cache = new Cache()

module.exports = (callerFilename, fileSpec) => {
  return cache.need(callerFilename, fileSpec)
}
