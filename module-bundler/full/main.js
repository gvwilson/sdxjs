// main.js

const topLeft = require('./top-left')
const topRight = require('./top-right') // requires 'top-left'
const bottomLeft = require('./subdir/bottom-left') // requires 'top-left' and 'bottom-right'
const bottomRight = require('./subdir/bottom-right') // requires 'bottom-left'

const main = () => {
  const functions = [topLeft, topRight, bottomLeft, bottomRight]
  functions.forEach(func => {
    console.log(`${func('main')}`)
  })
}

main()
