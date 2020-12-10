import { Row } from './easy-mode.js'

export default class PlacedRow extends Row {
  constructor (...children) {
    super(...children)
    this.x0 = null
    this.y0 = null
  }

  place (x0, y0) {
    this.x0 = x0
    this.y0 = y0
    const y1 = this.y0 + this.getHeight()
    let xCurrent = x0
    this.children.forEach(child => {
      const childY = y1 - child.getHeight()
      child.place(xCurrent, childY)
      xCurrent += child.getWidth()
    })
  }

  report () {
    return [
      'row', this.x0, this.y0,
      this.x0 + this.getWidth(),
      this.y0 + this.getHeight(),
      ...this.children.map(child => child.report())
    ]
  }
}
