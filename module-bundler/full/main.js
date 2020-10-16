// main.js

const topLeft = require('./top-left')                // none
const topRight = require('./top-right')              // needs top-left + bottom-right
const bottomLeft = require('./subdir/bottom-left')   // needs top-left + bottom-right
const bottomRight = require('./subdir/bottom-right') // none

const main = () => {
  const functions = [topLeft, topRight, bottomLeft, bottomRight]
  functions.forEach(func => {
    console.log(`${func('main')}`)
  })
}

main()
