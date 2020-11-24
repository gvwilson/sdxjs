import assert from 'assert'

import VirtualMachineBase from './vm-base.js'

class VirtualMachineSourceMap extends VirtualMachineBase {
  compile (lines) {
    const original = super.compile(lines)
    this.sourceMap = {}
    const result = original.map(command => this.transform(command))
    return result
  }

  transform (node) {
    if (!Array.isArray(node)) {
      return node
    }
    if (Array.length === 0) {
      return []
    }
    const [first, ...rest] = node
    if (typeof first !== 'number') {
      return [first, null, ...rest.map(arg => this.transform(arg))]
    }
    const [op, ...args] = rest
    this.sourceMap[first] =
      [op, first, ...args.map(arg => this.transform(arg))]
    return this.sourceMap[first]
  }

  exec (command) {
    const [op, lineNum, ...args] = command
    assert(op in this,
      `Unknown op "${op}"`)
    return this[op](args)
  }
}

export default VirtualMachineSourceMap
