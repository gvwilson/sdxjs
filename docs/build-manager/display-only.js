import graphlib from '@dagrejs/graphlib'

import GraphCreator from './graph-creator.js'

class DisplayOnly extends GraphCreator {
  run () {
    console.log('Graph')
    console.log(graphlib.json.write(this.graph))
    console.log('Sorted')
    console.log(graphlib.alg.topsort(this.graph))
  }
}

export default DisplayOnly
