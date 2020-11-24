import graphlib from '@dagrejs/graphlib'

import AddTimestamps from './add-timestamps.js'

class UpdateOnTimestamps extends AddTimestamps {
  run () {
    const sorted = graphlib.alg.topsort(this.graph)
    const startTime = 1 + Math.max(...sorted.map(
      n => this.graph.node(n).timestamp))
    console.log(`${startTime}: START`)
    const endTime = sorted.reduce((currTime, node) => {
      if (this.isStale(node)) {
        console.log(`${currTime}: ${node}`)
        this.graph.node(node).recipes.forEach(
          a => console.log(`    ${a}`))
        this.graph.node(node).timestamp = currTime
        currTime += 1
      }
      return currTime
    }, startTime)
    console.log(`${endTime}: END`)
  }

  isStale (node) {
    return this.graph.predecessors(node).some(
      other => this.graph.node(other).timestamp >=
        this.graph.node(node).timestamp
    )
  }
}

export default UpdateOnTimestamps
