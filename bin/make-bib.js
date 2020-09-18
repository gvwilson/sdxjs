#!/usr/bin/env node

'use strict'

import argparse from 'argparse'
import assert from 'assert'
import fs from 'fs'
import yaml from 'js-yaml'

import {makeBib} from './bib.js'

/**
 * Main driver.
 */
const main = () => {
  const config = getConfiguration()
  const data = yaml.safeLoad(fs.readFileSync(config.bibinput))
  const text = makeBib(data)
  fs.writeFileSync(config.biboutput, text)
}

/**
 * Build program configuration.
 * @returns {Object} Program configuration.
 */
const getConfiguration = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--bibinput')
  parser.add_argument('--biboutput')

  const config = parser.parse_args()

  assert(config.bibinput,
         `Need input file`)
  assert(config.biboutput,
         `Need output file`)
  return config
}

// Run program.
main()
