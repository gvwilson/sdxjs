#!/usr/bin/env node
'use strict'

/**
 * Display YAML-formatted list of terms defined.
 */

import argparse from 'argparse'
import fs from 'fs'

import {
  getGlossaryReferences,
  loadYaml
} from './utils.js'

/**
 * Main driver.
 */
const main = () => {
  const options = getOptions()
  const glossary = loadYaml(options.glossary)
  options.input.forEach(filename => {
    const text = fs.readFileSync(filename, 'utf-8')
    const refs = getGlossaryReferences(text)
    if (refs.length) {
      console.log(`${filename.split('/')[0]}:`)
      refs.forEach(key => {
        console.log(`  - ${glossary[key].en.term}`)
      })
    }
  })
}

/**
 * Build program options.
 * @returns {Object} Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--glossary')
  parser.add_argument('--input', { nargs: '+' })
  return parser.parse_args()
}

// Run program.
main()
