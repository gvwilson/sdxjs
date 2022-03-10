class RegexBase {
  constructor (rest) {
    this.rest = rest
  }

  match (text) {
    for (let i = 0; i <= text.length; i += 1) {
      if (this._match(text, i) !== undefined) {
        return true
      }
    }
    return false
  }

  _match (text, start) {
    throw new Error('derived classes must override \'_match\'')
  }
}

export default RegexBase
