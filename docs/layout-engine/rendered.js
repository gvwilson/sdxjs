import {
  PlacedBlock,
  PlacedCol,
  PlacedRow
} from './placed.js'

// [keep]
export class RenderedBlock extends PlacedBlock {
  render (screen, fill) {
    drawBlock(screen, this, fill)
  }
}

export class RenderedCol extends PlacedCol {
  render (screen, fill) {
    drawBlock(screen, this, fill)
  }
}

export class RenderedRow extends PlacedRow {
  render (screen, fill) {
    drawBlock(screen, this, fill)
  }
}

const drawBlock = (screen, node, fill) => {
  for (let ix = 0; ix < node.getWidth(); ix += 1) {
    for (let iy = 0; iy < node.getHeight(); iy += 1) {
      screen[node.y0 + iy][node.x0 + ix] = fill
    }
  }
}
// [/keep]
