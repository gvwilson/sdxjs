const initialize = (creators) => {

// /home/gvwilson/stjs/module-bundler/simple/main.js
creators.set('/home/gvwilson/stjs/module-bundler/simple/main.js',
(module, require) => {const other = require('./other')

const main = () => {
  console.log(other('main'))
}

module.exports = main
})

// /home/gvwilson/stjs/module-bundler/simple/other.js
creators.set('/home/gvwilson/stjs/module-bundler/simple/other.js',
(module, require) => {const other = (caller) => {
  return `other called from ${caller}`
}

module.exports = other
})


}

