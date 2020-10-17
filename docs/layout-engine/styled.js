const assert = require('assert')

const { Node, TagNode } = require('./dom')
const { CssRules } = require('./css')

class StyledNode {
  constructor (dom, cssRules) {
    assert(dom instanceof Node,
      'Require a node')
    assert(cssRules instanceof CssRules,
      'Require some rules')

    this.dom = dom
    this.cssRules = cssRules

    this.children = (this.dom instanceof TagNode)
      ? this.dom.children.map(child => new StyledNode(child, this.cssRules))
      : []

    this.rules = (this.dom instanceof TagNode)
      ? this.flattenRules(this.dom, this.cssRules)
      : CssRules.TEXT_RULES
  }

  flattenRules (dom) {
    const rules = this.cssRules.findRules(dom)
    const result = rules.reverse().reduce((obj, rule) => {
      obj = Object.assign(obj, rule.styles)
      return obj
    }, {})
    return result
  }

  get (key, defaultValue = null) {
    if (key in this.rules) {
      return this.rules[key]
    }
    assert(defaultValue !== null,
           `Cannot find ${key} and no default provided`)
    return defaultValue
  }
}

module.exports = { StyledNode }
