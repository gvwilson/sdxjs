const translate = {
  "/Users/gvwilson/stjs/module-bundler/simple/main.js": {
    "./other": "/Users/gvwilson/stjs/module-bundler/simple/other.js"
  },
  "/Users/gvwilson/stjs/module-bundler/simple/other.js": {}
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

// /Users/gvwilson/stjs/module-bundler/simple/main.js
creators.set('/Users/gvwilson/stjs/module-bundler/simple/main.js',
(module, require = makeRequire('/Users/gvwilson/stjs/module-bundler/simple/main.js')) =>
{const other = require('./other')

const main = () => {
  console.log(other('main'))
}

module.exports = main
})

// /Users/gvwilson/stjs/module-bundler/simple/other.js
creators.set('/Users/gvwilson/stjs/module-bundler/simple/other.js',
(module, require = makeRequire('/Users/gvwilson/stjs/module-bundler/simple/other.js')) =>
{const other = (caller) => {
  return `other called from ${caller}`
}

module.exports = other
})


}

initialize(creators)


const start = creators.get('/Users/gvwilson/stjs/module-bundler/simple/main.js')
const m = {}
start(m)
m.exports()

