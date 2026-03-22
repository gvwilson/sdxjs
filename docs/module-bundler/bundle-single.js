// eslint-disable
const translate = {
  "/u/stjs/stjs/module-bundler/single/main.js": {}
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

// /u/stjs/stjs/module-bundler/single/main.js
creators.set('/u/stjs/stjs/module-bundler/single/main.js',
(module, require = 
makeRequire('/u/stjs/stjs/module-bundler/single/main.js')) =>
{const main = () => {
  console.log('in main')
}

module.exports = main
})


}

initialize(creators)


const start = creators.get('/u/stjs/stjs/module-bundler/single/main.js')
const m = {}
start(m)
m.exports()

