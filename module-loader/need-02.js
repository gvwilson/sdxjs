const fs = require('fs')
const path = require('path')

class Cache {
  constructor () {
    this.loaded = new Map()
    this.constructSearchPath()
  }

  need (fileSpec) {
    if (this.loaded.has(fileSpec)) {
      console.log(`returning cached value for ${fileSpec}`)
      return this.loaded.get(fileSpec)
    }
    console.log(`loading value for ${fileSpec}`)
    const filePath = this.find(fileSpec)
    const content = fs.readFileSync(filePath, 'utf-8')
    const result = eval(content)
    this.loaded.set(fileSpec, result)
    return result
  }

  constructSearchPath () {
    this.searchPath = []
    if ('NEED_PATH' in process.env) {
      this.searchPath = process.env.NEED_PATH.split(':').filter(x => x.length > 0)
    }
  }

  find (fileSpec) {
    let result = undefined
    if (fileSpec.startsWith('.')) {
      console.log(`..trying local file for ${fileSpec}`)
      if (fs.existsSync(fileSpec)) {
        result = fileSpec
      }
    }
    else {
      for (let dir of this.searchPath) {
        const filePath = path.join(dir, fileSpec)
        console.log(`trying ${filePath} for ${fileSpec}`)
        if (fs.existsSync(filePath)) {
          result = filePath
          break
        }
      }
    }
    if (result === undefined) {
      throw new Error(`unable to import ${fileSpec}: no match found`)
    }
    return result
  }
}

const cache = new Cache()

module.exports = (fileSpec) => {
  return cache.need(fileSpec)
}
