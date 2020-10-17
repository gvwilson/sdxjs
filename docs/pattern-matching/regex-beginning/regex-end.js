const RegexBase = require('./regex-base')

class RegexEnd extends RegexBase {
  _match (text, start) {
    return undefined // FIXME
  }
}

module.exports = () => new RegexEnd()
