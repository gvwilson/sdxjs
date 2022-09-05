import {
  Block,
  Col,
  Row
} from './easy-mode.js'

// [block]
export class PlacedBlock extends Block {
  constructor (width, height) {
    super(width, height)
    this.x0 = null
    this.y0 = null
  }

  place (x0, y0) {
    this.x0 = x0
    this.y0 = y0
  }

  report () {
    return [
      'block', this.x0, this.y0,
      this.x0 + this.width,
      this.y0 + this.height
    ]
  }
}
// [/block]

// [col]
export class PlacedCol extends Col {
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
// [/col]

// [row]
export class PlacedRow extends Row {
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
// [/row]
