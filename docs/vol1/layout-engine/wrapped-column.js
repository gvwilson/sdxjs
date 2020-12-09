import PlacedColumn from './placed-column.js'

export default class WrappedColumn extends PlacedColumn {
  wrap () {
    const children = this.children.map(child => child.wrap())
    return new PlacedColumn(...children)
  }
}
