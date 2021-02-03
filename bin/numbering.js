#!/usr/bin/env node
'use strict'

/**
 * Generate a lookup table of slug => number or letter for a volume.
 */

import argparse from 'argparse'
import fs from 'fs'

import {
  loadYaml
} from './utils.js'

/**
 * Main driver.
 */
const main = () => {
  const options = getOptions()
  const volume = loadYaml(options.volume)
  const numbering = buildNumbering(volume)
  fs.writeFileSync(options.output,
    JSON.stringify(numbering, null, 2), 'utf-8')
}

/**
 * Build program options.
 * @returns {Object} Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--volume')
  parser.add_argument('--output')
  return parser.parse_args()
}

/**
 * Build numbering lookup table.
 * @param {Object} volume Volume information.
 * @returns {Object} slug-to-number-or-letter lookup table.
 */
const buildNumbering = (volume) => {
  const result = {}
  volume.chapters.forEach((entry, i) => {
    result[entry.slug] = `${i + 1}`
  })
  const start = 'A'.charCodeAt(0)
  volume.appendices.forEach((entry, i) => {
    result[entry.slug] = String.fromCharCode(start + i)
  })
  return result
}

// Run program.
main()
