const { Column } = require('./easy-mode.js')

class PlacedColumn extends Column {
  constructor (...children) {
    super(...children)
    this._x0 = null
    this._y1 = null
  }

  place (x0, y1) {
    this._x0 = x0
    this._y1 = y1
    let yCurrent = this._y1
    this._children.forEach(child => {
      child.place(x0, yCurrent)
      yCurrent -= child.height()
    })
  }

  report () {
    return [
      'column', this._x0, this._y1,
      ...this._children.map(child => child.report())
    ]
  }
}

module.exports = {
  Column: PlacedColumn
}
