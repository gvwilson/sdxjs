import RegexBase from './regex-base.js'

class RegexAny extends RegexBase {
  constructor (child) {
    super()
    this.child = child
  }

  _match (text, start) {
    return undefined // FIXME
  }
}

export default (child) => new RegexAny(child)
