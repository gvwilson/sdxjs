const RegexBase = require('./regex-base')

class RegexEnd extends RegexBase {
  constructor () {
    super()
  }

  _match (text, start) {
    return undefined // FIXME
  }
}

module.exports = () => new RegexEnd()
