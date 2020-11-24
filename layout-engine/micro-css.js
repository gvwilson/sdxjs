import assert from 'assert'

export class CssRule {
  constructor (order, selector, styles) {
    this.order = order
    this.selector = selector
    this.styles = styles
  }
}

export class IdRule extends CssRule {
  constructor (selector, styles) {
    assert(selector.startsWith('#') && (selector.length > 1),
      'ID rule must start with # and have a selector')
    super(IdRule.ORDER, selector.slice(1), styles)
  }

  match (node) {
    return ('id' in node.attributes) &&
      (node.attributes.id === this.selector)
  }
}
IdRule.ORDER = 0

export class ClassRule extends CssRule {
  constructor (selector, styles) {
    assert(selector.startsWith('.') && (selector.length > 1),
      'Class rule must start with . and have a selector')
    super(ClassRule.ORDER, selector.slice(1), styles)
  }

  match (node) {
    return ('class' in node.attributes) &&
      (node.attributes.class === this.selector)
  }
}
ClassRule.ORDER = 1

export class TagRule extends CssRule {
  constructor (selector, styles) {
    super(TagRule.ORDER, selector, styles)
  }

  match (node) {
    return this.selector === node.tag
  }
}
TagRule.ORDER = 2
