const { Block } = require('./easy-mode')

class PlacedBlock extends Block {
  constructor (width, height) {
    super(width, height)
    this._x0 = null
    this._y0 = null
  }

  place (x0, y1) {
    this._x0 = x0
    this._y1 = y1
  }

  report () {
    return ['block', this._x0, this._y1]
  }
}

module.exports = {
  Block: PlacedBlock
}
