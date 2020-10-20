const { Row } = require('./easy-mode')

class PlacedRow extends Row {
  constructor (...children) {
    super(...children)
    this._x0 = null
    this._y0 = null
  }

  place (x0, y1) {
    this._x0 = x0
    this._y1 = y1
    const y0 = y1 - this.height()
    let xCurrent = x0
    this._children.forEach(child => {
      child.place(xCurrent, y0 + child.height())
      xCurrent += child.width()
    })
  }

  report () {
    return [
      'row', this._x0, this._y1,
      ...this._children.map(child => child.report())
    ]
  }
}

module.exports = {
  Row: PlacedRow
}
