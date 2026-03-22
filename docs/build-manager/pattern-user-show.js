import graphlib from '@dagrejs/graphlib'

import PatternUserRead from './pattern-user-read.js'

class PatternUserShow extends PatternUserRead {
  run () {
    console.log(JSON.stringify(this.toJSON(), null, 2))
  }

  toJSON () {
    return {
      graph: graphlib.json.write(this.graph),
      rules: Array.from(this.rules.keys()).map(key => {
        return { k: key, v: this.rules.get(key) }
      })
    }
  }
}

export default PatternUserShow
