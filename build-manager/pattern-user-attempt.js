const graphlib = require('@dagrejs/graphlib')

const VariableExpander = require('./variable-expander')

class PatternUserAttempt extends VariableExpander {
  buildGraph () {
    super.buildGraph()
    this.extractRules()
    this.expandVariables()
  }

  extractRules () {
    this.rules = new Map()
    this.graph.nodes().forEach(target => {
      if (target.includes('%')) {
        const data = {
          actions: this.graph.node(target).actions
        }
        this.rules.set(target, data)
      }
    })
    this.rules.forEach((value, key) => {
      console.log('removing', key)
      this.graph.removeNode(key)
    })
  }
}

module.exports = PatternUserAttempt
