// subdir/bottom-right.js

const bottomLeft = require('./bottom-left')

const bottomRight = (caller) => {
  return `bottomRight from ${caller}`
}

module.exports = bottomRight
