const assert = require('assert')
const fs = require('fs')

const Assembler = require('./assembler')

const main = () => {
  assert(process.argv.length === 4,
    'Usage: as.js input|- output|-')
  const inFile = process.argv[2]
  const outFile = process.argv[3]
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
  const text = program.join('\n')
  fs.writeFileSync(filename, text, 'utf-8')
}

main()
