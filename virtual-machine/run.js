const fs = require('fs')

const VirtualMachine = require('./vm')

const main = () => {
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
