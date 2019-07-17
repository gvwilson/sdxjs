const assert = require('assert')
const deepmerge = require('deepmerge')

class Rule {
  constructor (order, selector, styles) {
    this.order = order
    this.selector = selector
    this.styles = styles
  }
}

class IdRule extends Rule {
  constructor (selector, styles) {
    assert(selector.startsWith('#') && (selector.length > 1),
           `ID rule must start with # and have a selector`)
    super(IdRule.ORDER, selector.slice(1), styles)
  }

  match (node) {
    return ('id' in node.attributes)
      && (node.attributes['id'] === this.selector)
  }
}
IdRule.ORDER = 0

class ClassRule extends Rule {
  constructor (selector, styles) {
    assert(selector.startsWith('.') && (selector.length > 1),
           `Class rule must start with . and have a selector`)
    super(ClassRule.ORDER, selector.slice(1), styles)
  }

  match (node) {
    return ('class' in node.attributes)
      && (node.attributes['class'] === this.selector)
  }
}
ClassRule.ORDER = 1

class TagRule extends Rule {
  constructor (selector, styles) {
    super(TagRule.ORDER, selector, styles)
  }

  match (node) {
    return this.selector === node.tag
  }
}
TagRule.ORDER = 2

class CssRules {
  constructor (json, mergeDefaults=true) {
    const combined = mergeDefaults
          ? deepmerge(CssRules.DEFAULT_RULES, json)
          : json
    this.rules = this.jsonToRules(combined)
  }

  jsonToRules (json) {
    return Object.keys(json).map(selector => {
      assert((typeof selector === 'string') && (selector.length > 0),
             `Require non-empty string as selector`)
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

CssRules.DEFAULT_RULES = {
  body: {
    visible: true,
    layout: 'vertical'
  },
  row: {
    visible: true,
    layout: 'horizontal'
  },
  col: {
    visible: true,
    layout: 'vertical'
  },
  p: {
    visible: true,
    layout: 'wrap'
  }
}

CssRules.TEXT_RULES = {
  visible: true
}

module.exports = {
  IdRule,
  ClassRule,
  TagRule,
  CssRules
}
