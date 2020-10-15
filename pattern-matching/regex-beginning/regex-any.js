const RegexBase = require('./regex-base')

class RegexAny extends RegexBase {
  constructor (child) {
    super()
    this.child = child
  }

  _match (text, start) {
    return undefined // FIXME
  }
}

module.exports = (child) => new RegexAny(child)
