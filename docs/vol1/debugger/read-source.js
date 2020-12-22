import fs from 'fs'

const readSource = (filename) => {
  if (filename === '-') {
    filename = process.stdin.fd
  }
  return fs.readFileSync(filename, 'utf-8')
    .split('\n')
}

export default readSource
