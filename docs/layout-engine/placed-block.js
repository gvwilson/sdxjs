const { Block } = require('./easy-mode')

class PlacedBlock extends Block {
  constructor (width, height) {
    super(width, height)
    this.x0 = null
    this.y0 = null
  }

  place (x0, y1) {
    this.x0 = x0
    this.y1 = y1
  }

  report () {
    return ['block', this.x0, this.y1]
  }
}

module.exports = {
  Block: PlacedBlock
}
