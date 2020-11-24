#!/usr/bin/env node

'use strict'

import argparse from 'argparse'
import fs from 'fs'
import htmlparser2 from 'htmlparser2'

/**
 * Nodes to ignore.
 */
const IGNORE = new Set('pre code #comment head footer nav cite'.split(' '))

/**
 * Main driver.
 */
const main = () => {
  const options = getOptions()
  const known = new Set()
  options.input.forEach(filename => {
    const text = fs.readFileSync(filename, 'utf-8')
    const doc = htmlparser2.parseDOM(text)[0]
    getWords(doc, known)
  })
  const sorted = [...known]
  sorted.sort((left, right) => {
    left = left.toLowerCase()
    right = right.toLowerCase()
    if (left < right) {
      return -1
    }
    if (left > right) {
      return 1
    }
    return 0
  })
  for (const word of sorted) {
    console.log(word)
  }
}

/**
 * Parse command-line arguments.
 * @returns {Object} options Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--input', { nargs: '+' })
  return parser.parse_args()
}

/**
 * Add words outside code blocks to accumulator set.
 * @param {Object} node Current node.
 * @param {Set} accum Accumulator.
 */
const getWords = (node, accum) => {
  if (node.type === 'text') {
    node.data.split(/\s+/g).forEach(word => {
      const tidied = tidy(word)
      if (tidied) {
        accum.add(tidied)
      }
    })
  } else if (!IGNORE.has(node.name)) {
    node.children.forEach(child => getWords(child, accum))
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
