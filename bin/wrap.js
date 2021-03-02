#!/usr/bin/env node
'use strict'

/**
 * Wrap and slice lines in sample output and replace home directory with
 * something innocuous.
 */

import argparse from 'argparse'
import fs from 'fs'
import path from 'path'
import url from 'url'

/**
 * Maximum width of lines in code inclusions.
 */
export const WIDTH = 72

/** Strip out file protocol. */
const PROTOCOL = 'file://'

/** Home directory to pretend to have. */
const FAKE = '/u/stjs'

/** How to show removed lines. */
const REMOVED = '...'

/** Default output slice size. */
const SLICE = 10

/**
 * Main driver.
 */
const main = () => {
  const options = getOptions()
  const lines = fs.readFileSync(0, 'utf-8')
    .trimEnd()
    .split('\n')
  const wrapped = wrap(lines)
  const selected = select(options, wrapped)
  selected.forEach(line => console.log(line))
}

/**
 * Get command-line options.
 * @returns {Object} Options.
 */
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

/**
 * Select lines vertically.
 * @param {Object} options Control settings.
 * @param {Array<string>} lines Lines to slice.
 * @returns {Array<string>} New array of output.
 */
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

/**
 * Wrap lines to maximum length with continuation characters.
 * @param {Array<string>} lines Lines to wrap.
 * @returns {Array<string>} Wrapped lines.
 */
const wrap = (lines) => {
  const home = dirname(import.meta.url).replace('/bin', '')
  const findIndent = /^( *)/
  const result = []
  lines.forEach(line => {
    if (line.length === 0) {
      result.push(line)
    } else {
      line = line.replace(PROTOCOL, '').replace(home, FAKE)
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

/**
 * Split an overly-long line.
 * @param {string} line Line to split.
 * @returns {Array<string>} Line as chunks.
 */
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

/**
 * Extract directory name from file path.
 * @param {string} callerURL Path to work with.
 * @returns {string} Directory name.
 */
const dirname = (callerURL) => {
  return path.dirname(url.fileURLToPath(callerURL))
}

// Run program.
main()
