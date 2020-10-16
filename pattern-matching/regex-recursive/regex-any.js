const RegexBase = require('./regex-base')

class RegexAny extends RegexBase {
  constructor (child, rest) {
    super(rest)
    this.child = child
  }

  _match (text, start) {
    const maxPossibleMatches = text.length - start
    for (let numMatches = 0; numMatches <= maxPossibleMatches; numMatches += 1) {
      const afterMany = this._matchMany(text, start, numMatches)
      if (afterMany !== undefined) {
        return afterMany
      }
    }
    return undefined
  }

  _matchMany (text, start, numMatches) {
    for (let i = 0; i < numMatches; i += 1) {
      start = this.child._match(text, start)
      if (start === undefined) {
        return undefined
      }
    }
    if (this.rest !== null) {
      return this.rest._match(text, start)
    }
    return start
  }
}

module.exports = (child, rest = null) => new RegexAny(child, rest)
