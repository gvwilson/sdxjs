const RegexBase = require('./regex-base')

class RegexStart extends RegexBase {
  _match (text, start) {
    return undefined // FIXME
  }
}

module.exports = () => new RegexStart()
