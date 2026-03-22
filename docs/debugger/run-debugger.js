import assert from 'assert'

import readSource from './read-source.js'

const main = () => {
  assert(process.argv.length === 5,
    'Usage: run-debugger.js ./vm ./debugger input|-')
  const VM = require(process.argv[2])
  const Debugger = require(process.argv[3])
  const inFile = process.argv[4]
  const lines = readSource(inFile)
  const dbg = new Debugger()
  const vm = new VM(lines, dbg)
  vm.run()
}

main()
