const graphlib = require('@dagrejs/graphlib')

const PatternUserRead = require('./pattern-user-read')

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

module.exports = PatternUserShow
