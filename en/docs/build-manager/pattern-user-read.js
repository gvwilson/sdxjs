import assert from 'assert'
import graphlib from '@dagrejs/graphlib'

import VariableExpander from './variable-expander.js'

class PatternUserRead extends VariableExpander {
  buildGraph () {
    this.buildGraphAndRules()
    this.expandVariables()
  }

  buildGraphAndRules () {
    this.graph = new graphlib.Graph()
    this.rules = new Map()
    this.config.forEach(rule => {
      if (rule.target.includes('%')) {
        const data = {
          recipes: rule.recipes,
          depends: rule.depends
        }
        this.rules.set(rule.target, data)
      } else {
        const timestamp = ('timestamp' in rule) ? rule.timestamp : null
        this.graph.setNode(rule.target, {
          recipes: rule.recipes,
          timestamp: timestamp
        })
        rule.depends.forEach(dep => {
          assert(!dep.includes('%'),
            'Cannot have "%" in a non-pattern rule')
          this.graph.setEdge(dep, rule.target)
        })
      }
    })
  }
}

export default PatternUserRead
