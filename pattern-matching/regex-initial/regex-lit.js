const RegexBase = require('./regex-base')

class RegexLit extends RegexBase {
  constructor (chars) {
    super()
    this.chars = chars
  }

  _match (text, start) {
    return undefined // FIXME
  }
}

module.exports = (chars) => new RegexLit(chars)
