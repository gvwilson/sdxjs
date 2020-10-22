const assert = require('assert')
const fs = require('fs')
const yaml = require('js-yaml')

const GraphCreator = require('./graph-creator')

class AddTimestamps extends GraphCreator {
  constructor (configFile, timestampFile) {
    super(configFile)
    this.timestampFile = timestampFile
  }

  buildGraph () {
    super.buildGraph()
    this.addTimestamps()
  }

  addTimestamps () {
    const times = yaml.safeLoad(fs.readFileSync(this.timestampFile, 'utf-8'))
    for (const node of Object.keys(times)) {
      assert(this.graph.hasNode(node),
             `Graph does not have node ${node}`)
      this.graph.node(node).timestamp = times[node]
    }
    const missing = this.graph.nodes().filter(
      n => !('timestamp' in this.graph.node(n))
    )
    assert.strictEqual(missing.length, 0,
      `Timestamp missing for node(s) ${missing}`)
  }

  run () {
    console.log(this.graph.nodes().map(
      n => `${n}: ${JSON.stringify(this.graph.node(n))}`
    ))
  }
}

module.exports = AddTimestamps
