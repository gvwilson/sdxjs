const RegexBase = require('./regex-base')

class RegexSeq extends RegexBase {
  constructor (...children) {
    super()
    this.children = children
  }

  _match (text, start) {
    return undefined // FIXME
  }
}

module.exports = (...children) => new RegexSeq(...children)
