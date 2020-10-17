const RegexBase = require('./regex-base')

class RegexAlt extends RegexBase {
  constructor (left, right) {
    super()
    this.left = left
    this.right = right
  }

  _match (text, start) {
    return undefined // FIXME
  }
}

module.exports = (left, right) => new RegexAlt(left, right)
