const assert = require('assert')
const fs = require('fs')
const yaml = require('js-yaml')
const graphlib = require('@dagrejs/graphlib')

const SimpleBuilder = require('./simple-builder')

class AddTimestamps extends SimpleBuilder {
  run () {
    this.decorate(process.argv[4])
    console.log(this.graph.nodes().map(
      n => `${n}: ${JSON.stringify(this.graph.node(n))}`
    ))
  }

  decorate (filename) {
    const decorations = yaml.safeLoad(fs.readFileSync(filename, 'utf-8'))
    for (const node of Object.keys(decorations)) {
      this.graph.node(node).timestamp = decorations[node]
    }
    const missing = this.graph.nodes().filter(
      n => !('timestamp' in this.graph.node(n))
    )
    assert.equal(missing.length, 0,
                 `Timestamp missing for node(s) ${missing}`)
  }
}

module.exports = AddTimestamps
