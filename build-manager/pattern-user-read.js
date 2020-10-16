const assert = require('assert')
const graphlib = require('@dagrejs/graphlib')

const VariableExpander = require('./variable-expander')

class PatternUserRead extends VariableExpander {
  buildGraph () {
    this.buildGraphAndRules()
    this.expandVariables()
  }

  run () {
    console.log(JSON.stringify(this.toJSON(), null, 2))
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
        const timestamp = ('timestamp' in rule)
          ? rule.timestamp
          : null
        this.graph.setNode(rule.target, {
          recipes: rule.recipes,
          timestamp: timestamp
        })
        rule.depends.forEach(dep => {
          assert(!dep.includes('%'),
            'Cannot have \'%\' in a non-pattern rule')
          this.graph.setEdge(dep, rule.target)
        })
      }
    })
  }

  toJSON () {
    return {
      graph: graphlib.json.write(this.graph),
      rules: Array.from(this.rules.keys()).map(key => {
        return { k: key, v: this.rules.get(key) }
      })
    }
  }
}

module.exports = PatternUserRead
