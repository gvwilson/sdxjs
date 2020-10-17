const fs = require('fs')
const path = require('path')

const loadModule = require('./load-module')

const need = (name) => {
  const absPath = path.resolve(name)
  if (!need.cache.has(absPath)) {
    const contents = loadModule(absPath, need)
    need.cache.set(absPath, contents)
  }
  return need.cache.get(absPath)
}
need.cache = new Map()

module.exports = need
