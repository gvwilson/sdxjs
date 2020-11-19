const assert = require('assert')
const fs = require('fs')

const VirtualMachine = require('./vm')

const main = () => {
  assert(process.argv.length === 3,
    'Usage: as.js input')
  const program = readProgram(process.argv[2])
  const vm = new VirtualMachine()
  vm.initialize(program)
  vm.run()
}

const readProgram = (filename) => {
  return fs.readFileSync(filename, 'utf-8')
    .trim()
    .split('\n')
    .map(instr => parseInt(instr, 16))
}

main()
