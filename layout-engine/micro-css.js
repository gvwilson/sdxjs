import assert from 'assert'

// [css]
export class CssRule {
  constructor (order, selector, styles) {
    this.order = order
    this.selector = selector
    this.styles = styles
  }
}
// [/css]

// [id]
export class IdRule extends CssRule {
  constructor (selector, styles) {
    assert(selector.startsWith('#') && (selector.length > 1),
      `ID rule ${selector} must start with # and have a selector`)
    super(IdRule.ORDER, selector.slice(1), styles)
  }

  match (node) {
    return ('attributes' in node) &&
      ('id' in node.attributes) &&
      (node.attributes.id === this.selector)
  }
}
IdRule.ORDER = 0
// [/id]

// [class]
export class ClassRule extends CssRule {
  constructor (selector, styles) {
    assert(selector.startsWith('.') && (selector.length > 1),
      `Class rule ${selector} must start with . and have a selector`)
    super(ClassRule.ORDER, selector.slice(1), styles)
  }

  match (node) {
    return ('attributes' in node) &&
      ('class' in node.attributes) &&
      (node.attributes.class === this.selector)
  }
}
ClassRule.ORDER = 1
// [/class]

// [tag]
export class TagRule extends CssRule {
  constructor (selector, styles) {
    super(TagRule.ORDER, selector, styles)
  }

  match (node) {
    return this.selector === node.tag
  }
}
TagRule.ORDER = 2
// [/tag]

// [ruleset]
export class CssRuleSet {
  constructor (json, mergeDefaults = true) {
    this.rules = this.jsonToRules(json)
  }

  jsonToRules (json) {
    return Object.keys(json).map(selector => {
      assert((typeof selector === 'string') && (selector.length > 0),
        'Require non-empty string as selector')
      if (selector.startsWith('#')) {
        return new IdRule(selector, json[selector])
      }
      if (selector.startsWith('.')) {
        return new ClassRule(selector, json[selector])
      }
      return new TagRule(selector, json[selector])
    })
  }

  findRules (node) {
    const matches = this.rules.filter(rule => rule.match(node))
    const sorted = matches.sort((left, right) => left.order - right.order)
    return sorted
  }
}
// [/ruleset]
