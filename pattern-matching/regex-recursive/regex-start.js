const RegexBase = require('./regex-base')

class RegexStart extends RegexBase {
  constructor (rest) {
    super(rest)
  }

  _match (text, start) {
    if (start !== 0) {
      return undefined
    }
    if (this.rest === null) {
      return 0
    }
    return this.rest._match(text, start)
  }
}

module.exports = (rest=null) => new RegexStart(rest)
