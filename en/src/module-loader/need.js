import path from 'path'

import loadModule from './load-module.js'

const need = (name) => {
  const absPath = path.resolve(name)
  if (!need.cache.has(absPath)) {
    const contents = loadModule(absPath, need)
    need.cache.set(absPath, contents)
  }
  return need.cache.get(absPath)
}
need.cache = new Map()

export default need
