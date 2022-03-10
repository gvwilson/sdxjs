import RegexBase from './regex-base.js'

class RegexLit extends RegexBase {
  constructor (chars, rest) {
    super(rest)
    this.chars = chars
  }

  _match (text, start) {
    const nextIndex = start + this.chars.length
    if (nextIndex > text.length) {
      return undefined
    }
    if (text.slice(start, nextIndex) !== this.chars) {
      return undefined
    }
    if (this.rest === null) {
      return nextIndex
    }
    return this.rest._match(text, nextIndex)
  }
}

export default (chars, rest = null) => new RegexLit(chars, rest)
