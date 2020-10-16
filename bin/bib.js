#!/usr/bin/env node

'use strict'

const argparse = require('argparse')
const assert = require('assert')
const fs = require('fs')
const yaml = require('js-yaml')

/**
 * Top of page.
 */
const HEADER = `---
---

<dl class="bibliography">
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
  const data = yaml.safeLoad(fs.readFileSync(options.input))
  const text = makeBib(data)
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

  const options = parser.parse_args()

  assert(options.input,
    'Need input file')
  assert(options.output,
    'Need output file')
  return options
}

/**
 * Convert YAML bibliography into HTML.
 * @param {Array<Object>} data YAML information.
 */
const makeBib = (data) => {
  const entries = data.map(entry => {
    assert('type' in entry,
      'All entries must have "type"')
    assert(entry.type in ReferenceHandlers,
      `Unknown reference type ${entry.type}`)
    return ReferenceHandlers[entry.type](entry)
  })
  return `${HEADER}${entries.join('\n\n')}${FOOTER}`
}

/**
 * Convert article.
 * @param {Object} entry YAML information.
 * @returns {string} HTML text.
 */
const article = (entry) => {
  return [
    key(entry),
    descriptionBegin(),
    credit(entry),
    title(entry, true),
    articleInfo(entry),
    note(entry),
    descriptionEnd()
  ].join('\n')
}

/**
 * Convert book.
 * @param {Object} entry YAML information.
 * @returns {string} HTML text.
 */
const book = (entry) => {
  return [
    key(entry),
    descriptionBegin(),
    credit(entry),
    title(entry, false),
    bookInfo(entry),
    note(entry),
    descriptionEnd()
  ].join('\n')
}

/**
 * Convert link.
 * @param {Object} entry YAML information.
 * @returns {string} HTML text.
 */
const link = (entry) => {
  return [
    key(entry),
    descriptionBegin(),
    credit(entry),
    title(entry, true),
    note(entry),
    descriptionEnd()
  ].join('\n')
}

/**
 * Lookup table for entry handlers.
 */
const ReferenceHandlers = {
  article,
  book,
  link
}

/**
 * Generate article information.
 * @param {Object} entry YAML information.
 * @returns {string} HTML text.
 */
const articleInfo = (entry) => {
  assert(('journal' in entry) && ('year' in entry) && ('doi' in entry),
    'Entry requires journal, year, and DOI')
  let details = ''
  if ('volume' in entry) {
    details = `${entry.volume}`
  }
  if ('number' in entry) {
    details = `${details}(${entry.number})`
  }
  if (details) {
    details = `, ${details}`
  }
  const doi = `<a href="https://doi.org/${entry.doi}">${entry.doi}</a>`
  return `${entry.journal}${details}, ${entry.year}, ${doi}.`
}

/**
 * Generate book information.
 * @param {Object} entry YAML information.
 * @returns {string} HTML text.
 */
const bookInfo = (entry) => {
  assert(('publisher' in entry) && ('year' in entry) && ('isbn' in entry),
    'Entry requires publisher, year, and ISBN')
  return `${entry.publisher}, ${entry.year}, ${entry.isbn}.`
}

/**
 * Generate credit (author or editor).
 * @param {Object} entry YAML information.
 * @returns {string} HTML text.
 */
const credit = (entry) => {
  assert(('author' in entry) || ('editor' in entry),
    'Entry must have author or editor')
  const suffix = ('editor' in entry) ? ' (eds.)' : ''
  let names = entry.author || entry.editor
  if (names.length === 2) {
    names = `${names[0]} and ${names[1]}`
  } else if (names.length > 2) {
    const front = names.slice(0, -1).join(', ')
    names = `${front}, and ${names.slice(-1)}`
  }
  return `${names}${suffix}:`
}

/**
 * Generate start of entry description.
 * @param {Object} entry YAML information.
 * @returns {string} HTML text.
 */
const descriptionBegin = (entry) => {
  return '<dd>'
}

/**
 * Generate end of entry description.
 * @param {Object} entry YAML information.
 * @returns {string} HTML text.
 */
const descriptionEnd = (entry) => {
  return '</dd>'
}

/**
 * Generate bibliography key.
 * @param {Object} entry YAML information.
 * @returns {string} HTML text.
 */
const key = (entry) => {
  assert('key' in entry,
    'Every entry must have key')
  return `<dt id="${entry.key}" class="bibliography">${entry.key}</dt>`
}

/**
 * Generate bibliographic note.
 * @param {Object} entry YAML information.
 * @returns {string} HTML text.
 */
const note = (entry) => {
  assert('note' in entry,
    'Every entry must have note')
  // FIXME: Markdown to HTML
  return `<em>${entry.note.trim()}</em>`
}

/**
 * Generate tite (possibly linking and/or quoting).
 * @param {Object} entry YAML information.
 * @returns {string} HTML text.
 */
const title = (entry, quote) => {
  assert('title' in entry,
    'Every entry must have title')
  let title = entry.title
  if ('url' in entry) {
    title = `<a href="${entry.url}">${title}</a>`
  }
  if (quote) {
    title = `"${title}"`
  }
  return `${title}.`
}

// Run program.
main()
