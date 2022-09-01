// major.js
const { middle } = require('./minor')

const top = () => {
  console.log('top')
  middle()
}

const bottom = () => {
  console.log('bottom')
}

top()

module.exports = { top, bottom }
