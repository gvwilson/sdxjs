const Upper = require('./upper')

class Middle extends Upper {
  constructor () {
    super()
    this.range = 'middle'
  }

  modify (text) {
    return `** ${super.modify(text)} **`
  }
}

module.exports = Middle
