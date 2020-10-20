const { Row } = require('./easy-mode')

class PlacedRow extends Row {
  constructor (...children) {
    super(...children)
    this.x0 = null
    this.y0 = null
  }

  place (x0, y1) {
    this.x0 = x0
    this.y1 = y1
    const y0 = y1 - this.getHeight()
    let xCurrent = x0
    this.children.forEach(child => {
      child.place(xCurrent, y0 + child.getHeight())
      xCurrent += child.getWidth()
    })
  }

  report () {
    return [
      'row', this.x0, this.y1,
      ...this.children.map(child => child.report())
    ]
  }
}

module.exports = {
  Row: PlacedRow
}
