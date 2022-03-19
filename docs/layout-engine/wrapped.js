import assert from 'assert'

import {
  PlacedBlock,
  PlacedCol,
  PlacedRow
} from './placed.js'

// [blockcol]
export class WrappedBlock extends PlacedBlock {
  wrap () {
    return this
  }
}

export class WrappedCol extends PlacedCol {
  wrap () {
    const children = this.children.map(child => child.wrap())
    return new PlacedCol(...children)
  }
}
// [/blockcol]

// [row]
export class WrappedRow extends PlacedRow {
  constructor (width, ...children) {
    super(...children)
    assert(width >= 0,
      'Need non-negative width')
    this.width = width
  }

  getWidth () {
    return this.width
  }

  // [wrap]
  wrap () {
    const children = this.children.map(child => child.wrap())
    const rows = []
    let currentRow = []
    let currentX = 0

    children.forEach(child => {
      const childWidth = child.getWidth()
      if ((currentX + childWidth) <= this.width) {
        currentRow.push(child)
        currentX += childWidth
      } else {
        rows.push(currentRow)
        currentRow = [child]
        currentX = childWidth
      }
    })
    rows.push(currentRow)

    const newRows = rows.map(row => new PlacedRow(...row))
    const newCol = new PlacedCol(...newRows)
    return new PlacedRow(newCol)
  }
  // [/wrap]
}
// [/row]
