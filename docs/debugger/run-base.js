import assert from 'assert'

import readSource from './read-source.js'
import VirtualMachineBase from './vm-base.js'

const main = () => {
  assert(process.argv.length === 3,
    'Usage: run-base.js input|-')
  const inFile = process.argv[2]
  const lines = readSource(inFile)
  const vm = new VirtualMachineBase(lines)
  vm.run()
}

main()
