#!/usr/bin/env node

'use strict'

import argparse from 'argparse'
import fs from 'fs'
import htmlparser2 from 'htmlparser2'
import yaml from 'js-yaml'

/**
 * Standard ignores.
 */
const IGNORES = {
  a: new Set(['href']),
  dt: new Set(['id']),
  g: new Set(['key']),
  h2: new Set(['id']),
  img: new Set(['src']),
  li: new Set(['id']),
  pre: new Set(['title']),
  x: new Set(['key'])
}

/**
 * Main driver.
 */
const main = () => {
  const options = getOptions()
  const result = {}
  const ignores = options.ignore ? IGNORES : {}
  options.input.forEach(filename => process(filename, result, ignores))
  setsToArrays(result)
  fs.writeFileSync(1, yaml.safeDump(result, { sortKeys: true }), 'utf-8')
}

/**
 * Parse command-line arguments.
 * @returns {Object} options Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--ignore', { action: 'store_true' })
  parser.add_argument('--input', { nargs: '+' })
  return parser.parse_args()
}

/**
 * Load and process HTML.
 * @param {string} filename File to parse.
 * @param {Object} result Where to accumulate data.
 * @param {Boolean} ignores What to ignore.
 * @returns {Object} Accumulator.
 */
const process = (filename, result, ignores) => {
  const text = fs.readFileSync(filename, 'utf-8').trim()
  htmlparser2.parseDOM(text).forEach(doc => recurse(doc, result, ignores))
  return result
}

/**
 * Recurse through tree, recording keys and attributes.
 * @param {Object} node Current node.
 * @param {Object} result Where to accumulate data.
 * @param {Boolean} ignores What to ignore.
 */
const recurse = (node, result, ignores) => {
  // Not a tag.
  if (node.type !== 'tag') {
    return
  }
  // Entry with this node name.
  const tag = node.name
  if (!(tag in result)) {
    result[tag] = {}
  }
  // Attributes.
  for (const name in node.attribs) {
    if ((tag in ignores) && ignores[tag].has(name)) {
      return // ignore
    }
    if (!(name in result[tag])) {
      result[tag][name] = new Set()
    }
    result[tag][name].add(node.attribs[name])
  }
  // Look further down.
  node.children.forEach(child => recurse(child, result, ignores))
}

/**
 * Convert sets to arrays for YAML.
 * @param {Object} data What's been found.
 */
const setsToArrays = (data) => {
  for (const name in data) {
    for (const attr in data[name]) {
      data[name][attr] = [...data[name][attr]]
    }
  }
}

// Run program.
main()
