import assert from 'assert'
import graphlib from '@dagrejs/graphlib'

import ConfigLoader from './config-loader.js'

class GraphCreator extends ConfigLoader {
  buildGraph () {
    this.graph = new graphlib.Graph()
    this.config.forEach(rule => {
      this.graph.setNode(rule.target, {
        recipes: rule.recipes
      })
      rule.depends.forEach(dep => this.graph.setEdge(dep, rule.target))
    })
  }

  checkCycles () {
    const cycles = graphlib.alg.findCycles(this.graph)
    assert.strictEqual(cycles.length, 0,
      `Dependency graph contains cycles ${cycles}`)
  }
}

export default GraphCreator
