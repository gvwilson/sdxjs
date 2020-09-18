#!/usr/bin/env node

'use strict'

import argparse from 'argparse'
import assert from 'assert'
import fs from 'fs'
import yaml from 'js-yaml'

import {makeGloss} from './gloss.js'

/**
 * Main driver.
 */
const main = () => {
  const config = getConfiguration()
  const data = config.input
        .map(filename => yaml.safeLoad(fs.readFileSync(filename)))
        .reduce((accum, current) => {
          current.forEach(item => {
            assert('slug' in item,
                   `Every definition must have a slug ${JSON.stringify(item)}`)
            accum[item.slug] = item
          })
          return accum
        }, {})
  const text = makeGloss(data)
  fs.writeFileSync(config.output, text)
}

/**
 * Build program configuration.
 * @returns {Object} Program configuration.
 */
const getConfiguration = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--input', {nargs: '+'})
  parser.add_argument('--output')

  const config = parser.parse_args()

  assert(config.input,
         `Need input file`)
  assert(config.output,
         `Need output file`)
  return config
}

// Run program.
main()
