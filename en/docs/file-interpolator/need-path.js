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

  // [skip]
  // [search]
  constructSearchPath () {
    this.searchPath = []
    if ('NEED_PATH' in process.env) {
      this.searchPath = process.env.NEED_PATH
        .split(':')
        .filter(x => x.length > 0)
    }
  }
  // [/search]

  // [find]
  find (fileSpec) {
    let result
    if (fileSpec.startsWith('.')) {
      console.log(`..trying local file for ${fileSpec}`)
      if (fs.existsSync(fileSpec)) {
        result = fileSpec
      }
    } else {
      for (const dir of this.searchPath) {
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
  // [/find]
  // [/skip]
}

const cache = new Cache()

export default (fileSpec) => {
  return cache.need(fileSpec)
}
