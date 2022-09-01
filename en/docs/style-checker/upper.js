class Upper {
  constructor () {
    this.name = 'upper'
  }

  report () {
    console.log(this.modify(this.name))
  }

  modify (text) {
    return text.toUpperCase()
  }
}

module.exports = Upper
