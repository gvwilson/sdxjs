const fs = require('fs')

const assemble = require('./assembler')

const main = () => {
  const inFile = process.argv[2]
  const outFile = process.argv[3]
  const lines = readSource(inFile)
  const program = assemble(lines)
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
