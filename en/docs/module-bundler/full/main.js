// main.js

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
