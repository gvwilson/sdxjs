const assert = require('assert')

const { IdRule, ClassRule, TagRule } = require('./micro-css')

class CssRuleSet {
  constructor (json, mergeDefaults = true) {
    this._rules = this.jsonToRules(json)
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
    const matches = this._rules.filter(rule => rule.match(node))
    const sorted = matches.sort((left, right) => left._order - right._order)
    return sorted
  }
}

module.exports = CssRuleSet
