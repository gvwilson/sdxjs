const RegexBase = require('./regex-base')

class RegexEnd extends RegexBase {
  _match (text, start) {
    if (start !== text.length) {
      return undefined
    }
    if (this.rest === null) {
      return text.length
    }
    return this.rest._match(text, start)
  }
}

module.exports = (rest = null) => new RegexEnd(rest)
