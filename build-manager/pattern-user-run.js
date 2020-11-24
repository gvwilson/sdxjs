import PatternUserRead from './pattern-user-read.js'

class PatternUserRun extends PatternUserRead {
  buildGraph () {
    this.buildGraphAndRules()
    this.expandAllRules()
    this.expandVariables()
  }

  expandAllRules () {
    this.graph.nodes().forEach(target => {
      if (this.graph.predecessors(target).length > 0) {
        return
      }
      const data = this.graph.node(target)
      if (data.recipes.length > 0) {
        return
      }
      const rule = this.findRule(target)
      if (!rule) {
        return
      }
      this.expandRule(target, rule)
    })
  }

  findRule (target) {
    const pattern = `%.${target.split('.')[1]}`
    return this.rules.has(pattern)
      ? this.rules.get(pattern)
      : null
  }

  expandRule (target, rule) {
    const stem = target.split('.')[0]
    rule.depends
      .map(dep => dep.replace('%', stem))
      .forEach(dep => this.graph.setEdge(dep, target))
    const recipes = rule.recipes.map(act => act.replace('%', stem))
    const timestamp = this.graph.node(target).timestamp
    this.graph.setNode(target, {
      recipes: recipes,
      timestamp: timestamp
    })
  }
}

export default PatternUserRun
