// top-right.js

const topLeft = require('./top-left')
const bottomRight = require('./subdir/bottom-right')

const topRight = (caller) => {
  const first = topLeft('topRight')
  const second = bottomRight('topRight')
  return `topRight from ${caller} with ${first} and ${second}`
}

module.exports = topRight
