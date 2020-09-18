#!/usr/bin/env node

'use strict'

import assert from 'assert'
import MarkdownIt from 'markdown-it'

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
 * Convert YAML glossary into HTML.
 * @param {Array<Object>} data YAML information.
 * @returns {string} HTML text.
 */
export const makeGloss = (data) => {
  const slugs = sortTerms(data)
  const items = slugs.map(slug => makeEntry(data[slug]))
  return `${HEADER}${items.join('\n')}${FOOTER}`
}

/**
 * Sort glossary entries by term.
 * @param {Array<Object>} data YAML information.
 * @returns {Array<string>} item slugs (keys) sorted by term.
 */
const sortTerms = (data) => {
  return Object.keys(data).sort((left, right) => {
    const leftTerm = data[left].en.term.toLowerCase()
    const rightTerm = data[right].en.term.toLowerCase()
    if (leftTerm < rightTerm) {
      return -1
    }
    else if (leftTerm > rightTerm) {
      return 1
    }
    return 0
  })
}

/**
 * Make a glossary entry.
 * @param {Object} entry YAML entry.
 * @returns {string} HTML text.
 */
const makeEntry = (entry) => {
  const acronym = ('acronym' in entry.en) ? ` (${entry.en.acronym})` : ''
  const term = `<dt id="${entry.slug}">${entry.en.term}${acronym}</dt>`
  const mdi = new MarkdownIt({html: true})
  const def = mdi.render(entry.en.def.replace('\n', ' '))
        .replace('<p>', '')
        .replace('</p>', '')
        .trim()
  const body = `<dd>${def}</dd>`
  return `${term}\n${body}`
}
