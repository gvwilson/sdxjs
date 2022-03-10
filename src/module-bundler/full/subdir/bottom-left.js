// subdir/bottom-left.js

const topLeft = require('../top-left')
const bottomRight = require('./bottom-right')

const bottomLeft = (caller) => {
  const first = topLeft('bottomLeft')
  const second = bottomRight('bottomLeft')
  return `bottomLeft from ${caller} with ${first} and ${second}`
}

module.exports = bottomLeft
