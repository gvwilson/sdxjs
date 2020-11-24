import Upper from './upper.js'

class Middle extends Upper {
  constructor () {
    super()
    this.range = 'middle'
  }

  modify (text) {
    return `** ${super.modify(text)} **`
  }
}

export default Middle
