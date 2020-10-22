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
          recipes: this.graph.node(target).recipes
        }
        this.rules.set(target, data)
      }
    })
    this.rules.forEach((value, key) => {
      this.graph.removeNode(key)
    })
  }
}

module.exports = PatternUserAttempt
