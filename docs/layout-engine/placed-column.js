import { Column } from './easy-mode.js'

class PlacedColumn extends Column {
  constructor (...children) {
    super(...children)
    this.x0 = null
    this.y1 = null
  }

  place (x0, y1) {
    this.x0 = x0
    this.y1 = y1
    let yCurrent = this.y1
    this.children.forEach(child => {
      child.place(x0, yCurrent)
      yCurrent -= child.getHeight()
    })
  }

  report () {
    return [
      'column', this.x0, this.y1,
      ...this.children.map(child => child.report())
    ]
  }
}

export { PlacedColumn as Column }
