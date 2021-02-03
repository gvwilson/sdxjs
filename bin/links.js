#!/usr/bin/env node
'use strict'

/**
 * Create a Markdown-formatted links table for use in generating HTML.
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
  const entries = loadYaml(options.input)
  const markdown = entries
    .map(entry => `[${entry.slug}]: ${entry.url}`)
    .join('\n')
  fs.writeFileSync(options.output, markdown, 'utf-8')
}

/**
 * Build program options.
 * @returns {Object} Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--input')
  parser.add_argument('--output')
  return parser.parse_args()
}

// Run program.
main()
