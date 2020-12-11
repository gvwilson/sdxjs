import {
  Block,
  Col,
  Row
} from './easy-mode.js'

// <block>
export class PlacedBlock extends Block {
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
// </block>

// <col>
export class PlacedCol extends Col {
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
      'col', this.x0, this.y1,
      ...this.children.map(child => child.report())
    ]
  }
}
// </col>

// <row>
export class PlacedRow extends Row {
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
// </row>
