import assert from 'assert'

// <css>
export class CssRule {
  constructor (order, selector, styles) {
    this.order = order
    this.selector = selector
    this.styles = styles
  }
}
// </css>

// <id>
export class IdRule extends CssRule {
  constructor (selector, styles) {
    assert(selector.startsWith('#') && (selector.length > 1),
      `ID rule ${selector} must start with # and have a selector`)
    super(IdRule.ORDER, selector.slice(1), styles)
  }

  match (node) {
    return ('id' in node.attributes) &&
      (node.attributes.id === this.selector)
  }
}
IdRule.ORDER = 0
// </id>

// <class>
export class ClassRule extends CssRule {
  constructor (selector, styles) {
    assert(selector.startsWith('.') && (selector.length > 1),
      `Class rule ${selector} must start with . and have a selector`)
    super(ClassRule.ORDER, selector.slice(1), styles)
  }

  match (node) {
    return ('class' in node.attributes) &&
      (node.attributes.class === this.selector)
  }
}
ClassRule.ORDER = 1
// </class>

// <tag>
export class TagRule extends CssRule {
  constructor (selector, styles) {
    super(TagRule.ORDER, selector, styles)
  }

  match (node) {
    return this.selector === node.tag
  }
}
TagRule.ORDER = 2
// </tag>
