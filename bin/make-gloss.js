#!/usr/bin/env node

'use strict'

import argparse from 'argparse'
import assert from 'assert'
import fs from 'fs'
import MarkdownIt from 'markdown-it'
import request from 'request'
import yaml from 'js-yaml'

/**
 * Glosario version of glossary.
 */
const GLOSARIO_URL = 'http://raw.githubusercontent.com/carpentries/glosario/master/glossary.yml'

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
  const config = getConfiguration()
  download(config, GLOSARIO_URL).then(glosario => {
    const local = getGlossary(config)
    const merged = mergeGlossaries(glosario, local)
    const required = getRequired(config)
    const filtered = filterGlossary(merged, required)
    const text = makeGloss(filtered)
    fs.writeFileSync(config.output, text)
  }).catch(err => {
    console.error('GOT ERROR', err)
  })
}

/**
 * Build program configuration.
 * @returns {Object} Program configuration.
 */
const getConfiguration = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--glosario', {action: 'store_true'})
  parser.add_argument('--input')
  parser.add_argument('--output')
  parser.add_argument('--sources', {nargs: '+'})

  const config = parser.parse_args()

  assert(config.input,
         `Need input file`)
  assert(config.output,
         `Need output file`)
  assert(config.sources,
         `Need source files`)
  return config
}

/**
 * Get local glossary from file.
 * @param {Object} config Program configuration.
 * @returns {Object} All entries keyed by slug.
 */
const getGlossary = (config) => {
  return yaml.safeLoad(fs.readFileSync(config.input, 'utf-8'))
}

/**
 * Merge glossaries.
 * @param {Array<Array<Object>>} glossaries All glossaries.
 * @returns {Object} Merged glossary.
 */
const mergeGlossaries = (...glossaries) => {
  return glossaries.reduce((accum, current) => {
    current.forEach(item => {
      accum[item.slug] = item
    })
    return accum
  }, {})
}

/**
 * Get required keys from files.
 * @param {Object} config Program configuration.
 * @param {Object} gloss All glossary entries.
 */
const getRequired = (config, gloss) => {
  // Required in files.
  const fromFiles = new Set(
    config.sources.map(filename => {
      const text = fs.readFileSync(filename, 'utf-8')
      return [...text.matchAll(/<g\s+key="(.+?)">/g)]
        .map(match => match[1])
    }).flat()
  )
  // FIXME: transitive closure of cross-references.
  return fromFiles
}

/**
 * Filter glossary entries by required key.
 * @param {Object} glossary Entire glossary.
 * @param {Set} keys Required keys.
 * @returns {Object} Subset of glossary.
 */
const filterGlossary = (glossary, keys) => {
  const result = {}
  keys.forEach(key => {
    result[key] = glossary[key]
  })
  return result
}

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

/**
 * Create a promise for downloading a file from a URL.
 * @param {Object} config Program configuration.
 * @param {string} url What to download.
 * @returns {Promise} Something to wait on.
 */
const download = (config, url) => {
  return new Promise((resolve, reject) => {
    if (!config.glosario) {
      resolve({})
    }
    request(url, (error, response, body) => {
      if (error) {
        reject(error)
      }
      if (response.statusCode != 200) {
        reject(`Invalid response: status code <${response.statusCode}>`)
      }
      resolve(yaml.safeLoad(body))
    })
  })
}

// Run program.
main()
