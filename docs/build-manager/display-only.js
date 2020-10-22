const graphlib = require('@dagrejs/graphlib')

const GraphCreator = require('./graph-creator')

class DisplayOnly extends GraphCreator {
  run () {
    console.log('Graph')
    console.log(graphlib.json.write(this.graph))
    console.log('Sorted')
    console.log(graphlib.alg.topsort(this.graph))
  }
}

module.exports = DisplayOnly
