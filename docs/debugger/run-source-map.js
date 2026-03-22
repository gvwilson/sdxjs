import assert from 'assert'

import readSource from './read-source.js'
import VirtualMachineSourceMap from './vm-source-map.js'

const main = () => {
  assert(process.argv.length === 3,
    'Usage: run-base.js input|-')
  const inFile = process.argv[2]
  const lines = readSource(inFile)
  const vm = new VirtualMachineSourceMap(lines)
  vm.run()
}

main()
