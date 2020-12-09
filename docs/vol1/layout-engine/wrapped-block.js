import PlacedBlock from './placed-block.js'

export default class WrappedBlock extends PlacedBlock {
  wrap () {
    return this
  }
}
