// minor.js
const { bottom } = require('./major')

const middle = () => {
  console.log('middle')
  bottom()
}

module.exports = { middle }
