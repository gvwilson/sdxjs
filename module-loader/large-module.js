const need = require('./need')

const small = need('small-module.js')

const large = (caller) => {
  console.log(`large from ${caller}`)
  small.publicFunction(`${caller} to large`)
}

module.exports = large
