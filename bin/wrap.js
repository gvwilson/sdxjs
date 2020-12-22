#!/usr/bin/env node

'use strict'

import argparse from 'argparse'
import fs from 'fs'

import { dirname } from './utils.js'

const WIDTH = 72
const PROTOCOL = 'file://'
const HOME = dirname(import.meta.url).replace('/bin', '')
const FAKE = '/u/stjs'
const REMOVED = '...'
const SLICE = 10

const main = () => {
  const options = getOptions()
  const lines = fs.readFileSync(0, 'utf-8')
    .trimEnd()
    .split('\n')
  const wrapped = wrap(lines)
  const selected = select(options, wrapped)
  selected.forEach(line => console.log(line))
}

const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--head', { type: 'int', default: null })
  parser.add_argument('--tail', { type: 'int', default: null })
  parser.add_argument('--slice', { action: 'store_true' })
  const options = parser.parse_args()
  if (options.slice) {
    if ((options.head !== null) || (options.tail !== null)) {
      console.error('wrap: cannot specify --slice with --head and/or --tail')
      process.exit(1)
    }
    options.head = SLICE
    options.tail = SLICE
  }
  return options
}

const select = (options, lines) => {
  if ((options.head === null) && (options.tail === null)) {
    return lines
  }
  let result = []
  if (options.head !== null) {
    result = result.concat(lines.slice(0, options.head))
  }
  result.push(REMOVED)
  if (options.tail !== null) {
    result = result.concat(lines.slice(-options.tail))
  }
  return result
}

const wrap = (lines) => {
  const findIndent = /^( *)/
  const result = []
  lines.forEach(line => {
    if (line.length === 0) {
      result.push(line)
    } else {
      line = line.replace(PROTOCOL, '').replace(HOME, FAKE)
      const match = findIndent.exec(line)
      const indent = match ? match[1] : ''
      let front = null
      let terminator = null
      while (line.length > 0) {
        [front, line, terminator] = split(line)
        result.push(`${front}${terminator}`)
        if (line.length > 0) {
          line = indent + line
        }
      }
    }
  })
  return result
}

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

main()
