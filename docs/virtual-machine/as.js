const assert = require('assert')
const fs = require('fs')

const main = () => {
  assert(process.argv.length === 5,
    'Usage: as.js assembler input|- output|-')
  const Assembler = require(process.argv[2])
  const inFile = process.argv[3]
  const outFile = process.argv[4]
  const lines = readSource(inFile)
  const as = new Assembler()
  const program = as.assemble(lines)
  writeProgram(outFile, program)
}

const readSource = (filename) => {
  if (filename === '-') {
    filename = process.stdin.fd
  }
  return fs.readFileSync(filename, 'utf-8')
    .split('\n')
}

const writeProgram = (filename, program) => {
  if (filename === '-') {
    filename = process.stdout.fd
  }
  const text = program.join('\n') + '\n'
  fs.writeFileSync(filename, text, 'utf-8')
}

main()
