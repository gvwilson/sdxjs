#!/usr/bin/env node
'use strict'

/**
 * Translate YAML glossary into Markdown.
 */

import argparse from 'argparse'
import fs from 'fs'
import MarkdownIt from 'markdown-it'

import {
  loadYaml
} from './utils.js'

/**
 * Top of page.
 */
const HEADER = `---
---

<dl class="glossary">
`

/**
 * Bottom of page.
 */
const FOOTER = `

</dl>
`

/**
 * Main driver.
 */
const main = () => {
  const options = getOptions()
  const source = loadYaml(options.input)
    .sort((left, right) => left.slug < right.slug ? -1 : 1)
  const entries = source.map(entry => formatEntry(entry))
  const text = `${HEADER}${entries.join('\n')}${FOOTER}`
  fs.writeFileSync(options.output, text, 'utf-8')
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

/**
 * Format a glossary entry.
 * @param {Object} entry YAML entry.
 * @returns {string} HTML text.
 */
const formatEntry = (entry) => {
  const acronym = ('acronym' in entry.en) ? ` (${entry.en.acronym})` : ''
  const term = `<dt id="${entry.slug}" class="glossary">${entry.en.term}${acronym}</dt>`
  const mdi = new MarkdownIt({ html: true })
  const def = mdi.render(entry.en.def.replace('\n', ' '))
    .replace('<p>', '')
    .replace('</p>', '')
    .trim()
    .replace(/<a href="#(.+?)">(.+?)<\/a>/g, fixCrossRef)
  const body = `<dd class="glossary">${def}</dd>`
  return `${term}\n${body}`
}

/**
 * Fix internal cross-reference links.
 * @param {string} match Entire matching string.
 * @param {string} key Key embedded in URL.
 * @param {string} value Visible text.
 * @returns {string} Patched definition.
 */
const fixCrossRef = (match, key, value) => {
  return `<g key="${key}">${value}</g>`
}

// Run program.
main()
