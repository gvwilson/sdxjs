const graphlib = require('@dagrejs/graphlib')

const AddTimestamps = require('./add-timestamps')

class UpdateOnTimestamp extends AddTimestamps {
  run () {
    this.decorate(process.argv[4])
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

  isStale (node) {
    return this.graph.predecessors(node).some(
      other => this.graph.node(other).timestamp >= this.graph.node(node).timestamp 
    )
  }
}

module.exports = UpdateOnTimestamp
