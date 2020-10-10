// top-right.js

const topLeft = require('./top-left')

const topRight = (caller) => {
  const first = topLeft('topRight')
  return `topRight from ${caller} with ${first}`
}

module.exports = topRight
