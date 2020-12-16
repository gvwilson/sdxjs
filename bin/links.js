#!/usr/bin/env node

'use strict'

import argparse from 'argparse'
import fs from 'fs'

import {
  addCommonArguments,
  buildOptions,
  createFilePaths,
  getAllSources,
  yamlLoad,
  yamlSave
} from './utils.js'

const main = () => {
  const options = getOptions()
  createFilePaths(options)
  const needed = getNeeded(options)
  const available = yamlLoad(options.input)
  const result = available.filter(entry => needed.has(entry.slug))
  yamlSave(options.output, result)
}

/**
 * Build program options.
 * @returns {Object} Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  addCommonArguments(parser, '--input', '--output')
  parser.add_argument('--also', { nargs: '+' })
  const fromArgs = parser.parse_args()
  const options = buildOptions(fromArgs)
  return options
}

/**
 * Get all needed link keys.
 * @param {Object} options Program options.
 * @returns {Set} Needed keys.
 */
const getNeeded = (options) => {
  const result = new Set()
  getAllSources(options).forEach(filename => getLinkKeys(filename, result))
  options.also.forEach(filename => getLinkKeys(filename, result))
  return result
}

/**
 * Get link keys from a single file.
 * @param {string} filename What file to read.
 * @param {Set} accum Accumulated keys.
 */
const getLinkKeys = (filename, accum) => {
  const text = fs.readFileSync(filename, 'utf-8')
  const matches = [...text.matchAll(/\[.+?\]\[(.+?)\]/g)]
  matches
    .map(match => match[1])
    .forEach(key => accum.add(key))
}

main()
