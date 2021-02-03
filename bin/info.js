#!/usr/bin/env node
'use strict'

/**
 * Get information from configuration files to set Makefile variables.
 */

import argparse from 'argparse'
import assert from 'assert'

import {
  loadConfig
} from './utils.js'

/**
 * Main driver.
 */
const main = () => {
  const options = getOptions()
  const config = loadConfig(options.site, options.volume)
  let result = null
  switch (options.get) {
    case 'slugs':
      result = [...config.chapters, ...config.appendices].map(entry => entry.slug)
      break
    default:
      assert(false, `Unknown info request ${options.get}`)
      break
  }
  console.log(result.join(' '))
}

/**
 * Build program options.
 * @returns {Object} Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--site')
  parser.add_argument('--volume')
  parser.add_argument('--get')
  return parser.parse_args()
}

// Run program.
main()
