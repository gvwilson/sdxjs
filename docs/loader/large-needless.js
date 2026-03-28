const small = need('small-module.js')

const large = (caller) => {
  return small.publicFunction(`large called from ${caller}`)
}

module.exports = large
