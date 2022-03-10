// [erase]
import {
  WrappedBlock,
  WrappedCol,
  WrappedRow
} from './wrapped.js'
// [/erase]
export class DomBlock extends WrappedBlock {
  constructor (lines) {
    super(
      Math.max(...lines.split('\n').map(line => line.length)),
      lines.length
    )
    this.lines = lines
    this.tag = 'text'
    this.rules = null
  }

  findRules (css) {
    this.rules = css.findRules(this)
  }
}

export class DomCol extends WrappedCol {
  constructor (attributes, ...children) {
    super(...children)
    this.attributes = attributes
    this.tag = 'col'
    this.rules = null
  }

  findRules (css) {
    this.rules = css.findRules(this)
    this.children.forEach(child => child.findRules(css))
  }
}

export class DomRow extends WrappedRow {
  constructor (attributes, ...children) {
    super(0, ...children)
    this.attributes = attributes
    this.tag = 'row'
    this.rules = null
  }

  findRules (css) {
    this.rules = css.findRules(this)
    this.children.forEach(child => child.findRules(css))
  }
}
