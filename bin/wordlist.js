#!/usr/bin/env node

'use strict'

const argparse = require('argparse')
const assert = require('assert')
const fs = require('fs')
const parse5 = require('parse5')
const yaml = require('js-yaml')

/**
 * Nodes to ignore.
 */
const IGNORE = new Set('pre code #comment head footer nav cite'.split(' '))

/**
 * Main driver.
 */
const main = () => {
  const config = getConfiguration()
  const known = new Set()
  config.input.forEach(filename => {
    const text = fs.readFileSync(filename, 'utf-8')
    const doc = parse5.parse(text, {sourceCodeLocationInfo: true})
    getWords(doc, known)
  })
  for (const word of known) {
    console.log(word)
  }
}

/**
 * Parse command-line arguments.
 * @returns {Object} config Program configuration.
 */
const getConfiguration = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--input', {nargs: '+'})
  return parser.parse_args()
}

/**
 * Add words outside code blocks to accumulator set.
 * @param {Object} node Current node.
 * @param {Set} accum Accumulator.
 */
const getWords = (node, accum) => {
  if (IGNORE.has(node.nodeName)) {
    return
  }
  else if ('childNodes' in node) {
    node.childNodes.forEach(child => getWords(child, accum))
  }
  else if (node.nodeName === '#text') {
    node.value.split(/\s+/g).forEach(word => {
      const tidied = tidy(word)
      if (tidied) {
        accum.add(tidied)
      }
    })
  }
}

/**
 * Tidy up a single word.
 * @param {string} word What to tidy.
 * @returns {string} Tidied word (possibly empty).
 */
const tidy = (word) => {
  return word
    .replace(/[,\?\(\)":;…©«»▿]/g, '')
    .replace(/\.$/g, '')
    .replace(/^'/g, '')
    .replace(/'$/g, '')
    .replace(/^[\d-\.]+$/g, '')
    .trim()
}

// Run program.
main()
