const fs = require('fs')

class Cache {
  constructor () {
    this.loaded = new Map()
  }

  need (name) {
    if (this.loaded.has(name)) {
      console.log(`returning cached value for ${name}`)
      return this.loaded.get(name)
    }
    console.log(`loading ${name}`)
    const content = fs.readFileSync(name, 'utf-8')
    const result = eval(content)
    this.loaded.set(name, result)
    return result
  }
}

const cache = new Cache()

module.exports = (name) => {
  return cache.need(name)
}
