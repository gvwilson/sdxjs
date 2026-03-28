// eslint-disable
const translate = {
  "/u/stjs/stjs/module-bundler/simple/main.js": {
    "./other": "/u/stjs/stjs/module-bundler/simple/other.js"
  },
  "/u/stjs/stjs/module-bundler/simple/other.js": {}
}
const creators = new Map()
const cache = new Map()

const makeRequire = (absPath) => {
  return (localPath) => {
    const actualKey = translate[absPath][localPath]
    if (!cache.has(actualKey)) {
      const m = {}
      creators.get(actualKey)(m)
      cache.set(actualKey, m.exports)
    }
    return cache.get(actualKey)
  }
}

const initialize = (creators) => {

// /u/stjs/stjs/module-bundler/simple/main.js
creators.set('/u/stjs/stjs/module-bundler/simple/main.js',
(module, require =
makeRequire('/u/stjs/stjs/module-bundler/simple/main.js')) =>
{const other = require('./other')

const main = () => {
  console.log(other('main'))
}

module.exports = main
})

// /u/stjs/stjs/module-bundler/simple/other.js
creators.set('/u/stjs/stjs/module-bundler/simple/other.js',
(module, require =
makeRequire('/u/stjs/stjs/module-bundler/simple/other.js')) =>
{const other = (caller) => {
  return `other called from ${caller}`
}

module.exports = other
})


}

initialize(creators)


const start = creators.get('/u/stjs/stjs/module-bundler/simple/main.js')
const m = {}
start(m)
m.exports()

