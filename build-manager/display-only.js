const graphlib = require('@dagrejs/graphlib')

const SimpleBuilder = require('./simple-builder')

class DisplayOnly extends SimpleBuilder {
  run () {
    console.log(graphlib.json.write(this.graph))
    console.log(graphlib.alg.topsort(this.graph))
  }
}

module.exports = DisplayOnly
