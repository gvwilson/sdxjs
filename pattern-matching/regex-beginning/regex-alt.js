import RegexBase from './regex-base.js'

class RegexAlt extends RegexBase {
  constructor (left, right) {
    super()
    this.left = left
    this.right = right
  }

  _match (text, start) {
    return undefined // FIXME
  }
}

export default (left, right) => new RegexAlt(left, right)
