import { Col } from './easy-mode.js'

export default class PlacedCol extends Col {
  constructor (...children) {
    super(...children)
    this.x0 = null
    this.y1 = null
  }

  place (x0, y0) {
    this.x0 = x0
    this.y0 = y0
    let yCurrent = this.y0
    this.children.forEach(child => {
      child.place(x0, yCurrent)
      yCurrent += child.getHeight()
    })
  }

  report () {
    return [
      'col', this.x0, this.y0,
      this.x0 + this.getWidth(),
      this.y0 + this.getHeight(),
      ...this.children.map(child => child.report())
    ]
  }
}
