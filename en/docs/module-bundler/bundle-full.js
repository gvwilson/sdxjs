// eslint-disable
const translate = {
  "/u/stjs/stjs/module-bundler/full/main.js": {
    "./top-left": "/u/stjs/stjs/module-bundler/full/top-left.js",
    "./top-right": "/u/stjs/stjs/module-bundler/full/top-right.js",
    "./subdir/bottom-left": "/u/stjs/stjs/module-bundler/full/subdir/bottom-left.js",
    "./subdir/bottom-right": "/u/stjs/stjs/module-bundler/full/subdir/bottom-right.js"
  },
  "/u/stjs/stjs/module-bundler/full/subdir/bottom-right.js": {},
  "/u/stjs/stjs/module-bundler/full/subdir/bottom-left.js": {
    "../top-left": "/u/stjs/stjs/module-bundler/full/top-left.js",
    "./bottom-right": "/u/stjs/stjs/module-bundler/full/subdir/bottom-right.js"
  },
  "/u/stjs/stjs/module-bundler/full/top-left.js": {},
  "/u/stjs/stjs/module-bundler/full/top-right.js": {
    "./top-left": "/u/stjs/stjs/module-bundler/full/top-left.js",
    "./subdir/bottom-right": "/u/stjs/stjs/module-bundler/full/subdir/bottom-right.js"
  }
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

// /u/stjs/stjs/module-bundler/full/main.js
creators.set('/u/stjs/stjs/module-bundler/full/main.js',
(module, require = makeRequire('/u/stjs/stjs/module-bundler/full/main.js')) =>
{// main.js

const topLeft = require('./top-left')
const topRight = require('./top-right')
const bottomLeft = require('./subdir/bottom-left')
const bottomRight = require('./subdir/bottom-right')

const main = () => {
  const functions = [topLeft, topRight, bottomLeft, bottomRight]
  functions.forEach(func => {
    console.log(`${func('main')}`)
  })
}

module.exports = main
})

// /u/stjs/stjs/module-bundler/full/subdir/bottom-right.js
creators.set('/u/stjs/stjs/module-bundler/full/subdir/bottom-right.js',
(module, require = makeRequire('/u/stjs/stjs/module-bundler/full/subdir/bottom-right.js')) =>
{// subdir/bottom-right.js

const bottomRight = (caller) => {
  return `bottomRight from ${caller}`
}

module.exports = bottomRight
})

// /u/stjs/stjs/module-bundler/full/subdir/bottom-left.js
creators.set('/u/stjs/stjs/module-bundler/full/subdir/bottom-left.js',
(module, require = makeRequire('/u/stjs/stjs/module-bundler/full/subdir/bottom-left.js')) =>
{// subdir/bottom-left.js

const topLeft = require('../top-left')
const bottomRight = require('./bottom-right')

const bottomLeft = (caller) => {
  const first = topLeft('bottomLeft')
  const second = bottomRight('bottomLeft')
  return `bottomLeft from ${caller} with ${first} and ${second}`
}

module.exports = bottomLeft
})

// /u/stjs/stjs/module-bundler/full/top-left.js
creators.set('/u/stjs/stjs/module-bundler/full/top-left.js',
(module, require = makeRequire('/u/stjs/stjs/module-bundler/full/top-left.js')) =>
{// top-left.js

const topLeft = (caller) => {
  return `topLeft from ${caller}`
}

module.exports = topLeft
})

// /u/stjs/stjs/module-bundler/full/top-right.js
creators.set('/u/stjs/stjs/module-bundler/full/top-right.js',
(module, require = makeRequire('/u/stjs/stjs/module-bundler/full/top-right.js')) =>
{// top-right.js

const topLeft = require('./top-left')
const bottomRight = require('./subdir/bottom-right')

const topRight = (caller) => {
  const first = topLeft('topRight')
  const second = bottomRight('topRight')
  return `topRight from ${caller} with ${first} and ${second}`
}

module.exports = topRight
})


}

initialize(creators)


const start = creators.get('/u/stjs/stjs/module-bundler/full/main.js')
const m = {}
start(m)
m.exports()

