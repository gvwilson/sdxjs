const graphlib = require('@dagrejs/graphlib')

const PatternUserRead = require('./pattern-user-read')

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

  run () {
    const sorted = graphlib.alg.topsort(this.graph)
    const startTime = Math.max(...sorted.map(n => this.graph.node(n).timestamp))
    console.log(`${startTime}: START`)
    const endTime = sorted.reduce((currTime, node) => {
      if (this.isStale(node)) {
        console.log(`${currTime}: ${node}`)
        this.graph.node(node).recipes.forEach(a => console.log(`    ${a}`))
        this.graph.node(node).timestamp = currTime
        currTime += 1
      }
      return currTime
    }, startTime + 1)
    console.log(`${endTime}: END`)
  }
}

module.exports = PatternUserRun
