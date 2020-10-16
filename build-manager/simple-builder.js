const assert = require('assert')
const fs = require('fs')
const yaml = require('js-yaml')
const graphlib = require('@dagrejs/graphlib')

class SimpleBuilder {
  constructor (configName = null) {
    this.config = yaml.safeLoad(fs.readFileSync(configName, 'utf-8'))
    this.checkConfig()
  }

  build () {
    this.buildGraph()
    this.checkCycles()
    this.run()
  }

  checkConfig () {
    assert(Array.isArray(this.config),
      'Configuration must be array')
    this.config.forEach(rule => {
      assert(('target' in rule) && (typeof rule.target === 'string'),
             `Rule ${JSON.stringify(rule)} does not string as 'target'`)
      assert(('depends' in rule) &&
             Array.isArray(rule.depends) &&
             rule.depends.every(dep => (typeof dep === 'string')),
             `Rule ${JSON.stringify(rule)} does not have list of strings as 'depends'`)
      assert(('recipes' in rule) &&
             Array.isArray(rule.recipes) &&
             rule.recipes.every(recipe => (typeof recipe === 'string')),
             `Rule ${JSON.stringify(rule)} does not have list of strings as 'recipes'`)
    })
  }

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

  run () {
    assert.fail('run method not implemented')
  }
}

module.exports = SimpleBuilder
