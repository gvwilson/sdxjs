const assert = require('assert')

class CssRule {
  constructor (order, selector, styles) {
    this._order = order
    this._selector = selector
    this._styles = styles
  }
}

class IdRule extends CssRule {
  constructor (selector, styles) {
    assert(selector.startsWith('#') && (selector.length > 1),
      'ID rule must start with # and have a selector')
    super(IdRule.ORDER, selector.slice(1), styles)
  }

  match (node) {
    return ('id' in node._attributes) &&
      (node._attributes.id === this._selector)
  }
}
IdRule.ORDER = 0

class ClassRule extends CssRule {
  constructor (selector, styles) {
    assert(selector.startsWith('.') && (selector.length > 1),
      'Class rule must start with . and have a selector')
    super(ClassRule.ORDER, selector.slice(1), styles)
  }

  match (node) {
    return ('class' in node._attributes) &&
      (node._attributes.class === this._selector)
  }
}
ClassRule.ORDER = 1

class TagRule extends CssRule {
  constructor (selector, styles) {
    super(TagRule.ORDER, selector, styles)
  }

  match (node) {
    return this._selector === node._tag
  }
}
TagRule.ORDER = 2

module.exports = { IdRule, ClassRule, TagRule }
