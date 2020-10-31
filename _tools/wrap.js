#!/usr/bin/env node

const readline = require('readline')

const WIDTH = 72
const HOME = __dirname.replace('/_tools', '')
const FAKE = '/u/stjs'

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

reader.on('line', (line) => {
  line = line.replace(HOME, FAKE)
  let front = null
  let terminator = null
  while (line.length > 0) {
    [front, line, terminator] = split(line)
    console.log(`${front}${terminator}`)
  }
})

const split = (line) => {
  if (line.length <= WIDTH) {
    return [line, '', '']
  }
  for (let i = WIDTH; i > 0; i -= 1) {
    if (line[i] === ' ') {
      const front = line.slice(0, i)
      const back = line.slice(i)
      return [front, back, ' \\']
    }
  }
  return [line.slice(0, WIDTH), line.slice(WIDTH), ' \\']
}
