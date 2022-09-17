// eslint-disable no-eval
import fs from 'fs'
import path from 'path'

class Cache {
  constructor () {
    this.loaded = new Map()
    this.constructSearchPath()
  }

  need (fileSpec) {
    if (this.loaded.has(fileSpec)) {
      return this.loaded.get(fileSpec)
    }
    const [filePath, fileDir] = this.find(fileSpec)
    const content = fs.readFileSync(filePath, 'utf-8')
    const interpolated = this.interpolate(fileDir, content)
    const result = eval(interpolated)
    this.loaded.set(fileSpec, result)
    return result
  }

  constructSearchPath () {
    this.searchPath = []
    if ('NEED_PATH' in process.env) {
      this.searchPath = process.env.NEED_PATH
        .split(':')
        .filter(x => x.length > 0)
    }
  }

  find (fileSpec) {
    let filePath
    let fileDir
    if (fileSpec.startsWith('.')) {
      if (fs.existsSync(fileSpec)) {
        filePath = fileSpec
        fileDir = '.'
      }
    } else {
      for (const dir of this.searchPath) {
        const tempPath = path.join(dir, fileSpec)
        if (fs.existsSync(tempPath)) {
          filePath = tempPath
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
    return outer.replace(Cache.INTERPOLATE_PAT,
                         (match, comment, filename) => {
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

export default (fileSpec) => {
  return cache.need(fileSpec)
}
