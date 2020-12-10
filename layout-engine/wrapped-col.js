import PlacedCol from './placed-col.js'

export default class WrappedCol extends PlacedCol {
  wrap () {
    const children = this.children.map(child => child.wrap())
    return new PlacedCol(...children)
  }
}
