import RegexBase from './regex-base.js'

class RegexSeq extends RegexBase {
  constructor (...children) {
    super()
    this.children = children
  }

  _match (text, start) {
    return undefined // FIXME
  }
}

export default (...children) => new RegexSeq(...children)
