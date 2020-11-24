import timeFunc from './time-func'

const text = `
import fs from 'fs'

const assignment = (range) => {
  let j = 0
  for (let i=0; i<range; i+=1) {
    j = i
  }
}

const readFile = (range, filename) => {
  for (let i=0; i<range; i+=1) {
    fs.readFileSync(filename, 'utf-8')
  }
}

const numLoops = 100000
assignment(numLoops)
readFile(numLoops, 'index.md')
`

const program = timeFunc(text)
console.log(program)
console.log('OUTPUT')
eval(program) // eslint-disable-line
