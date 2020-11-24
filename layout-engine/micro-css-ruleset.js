import assert from 'assert'

import { IdRule, ClassRule, TagRule } from './micro-css.js'

class CssRuleSet {
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

export default CssRuleSet
