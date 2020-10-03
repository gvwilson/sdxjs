#!/usr/bin/env node

'use strict'

const argparse = require('argparse')
const fs = require('fs')
const parse5 = require('parse5')
const yaml = require('js-yaml')

/**
 * Main driver.
 */
const main = () => {
  const config = getConfiguration()
  const files = loadFiles(config)
  checkGloss(files)
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
 * Load and process HTML.
 * @param {Object} config Program configuration.
 */
const loadFiles = (config) => {
  return config.input.map(filename => {
    const text = fs.readFileSync(filename, 'utf-8').trim()
    const doc = parse5.parse(text, {sourceCodeLocationInfo: true})
    return {filename, text, doc}
  })
}

/**
 * Check glossary references and entries.
 * @param {Array<Object>} files File information.
 */
const checkGloss = (files) => {
  const used = new Set(files.map(fileInfo => {
    const matches = [...fileInfo.text.matchAll(/<g\s+key="(.+?)">/g)]
    return matches.map(match => match[1])
  }).flat())
  const defined = new Set(files.map(fileInfo => {
    const matches = [...fileInfo.text.matchAll(/<dt\s+id="(.+?)"\s+class="glossary">/g)]
    return matches.map(match => match[1])
  }).flat())
  showSetDiff('glossary used but not defined', used, defined)
  showSetDiff('glossary defined but not used', defined, used)
}

/**
 * Show differences (if any) between two sets.
 * @param {string} title Title string.
 * @param {Set} left One set.
 * @param {Set} right Other set.
 */
const showSetDiff = (title, left, right) => {
  const diff = Array.from(left).filter(item => !right.has(item)).sort()
  if (diff.length > 0) {
    console.log(`${title}\n- ${diff.join('\n- ')}`)
  }
}

// Run program.
main()
