const assert = require('assert')

const readSource = require('./read-source')

const main = () => {
  assert(process.argv.length === 4,
    'Usage: run-base.js ./vm input|-')
  const VM = require(process.argv[2])
  const inFile = process.argv[3]
  const lines = readSource(inFile)
  const vm = new VM(lines)
  vm.run()
}

main()
