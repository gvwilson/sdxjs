import assert from 'assert'

import readSource from './read-source.js'
import VirtualMachineCallback from './vm-callback.js'
import DebuggerTrace from './debugger-trace.js'

const main = () => {
  assert(process.argv.length === 3,
    'Usage: run-debugger.js input|-')
  const inFile = process.argv[2]
  const lines = readSource(inFile)
  const dbg = new DebuggerTrace()
  const vm = new VirtualMachineCallback(lines, dbg)
  vm.run()
}

main()
