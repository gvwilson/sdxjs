import { Block } from './easy-mode.js'

export default class PlacedBlock extends Block {
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
    return ['block', this.x0, this.y0,
            this.x0 + this.width,
            this.y0 + this.height]
  }
}
