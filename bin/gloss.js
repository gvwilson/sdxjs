#!/usr/bin/env node

'use strict'

import argparse from 'argparse'
import fs from 'fs'
import MarkdownIt from 'markdown-it'
import request from 'request'
import yaml from 'js-yaml'

import {
  addCommonArguments,
  buildOptions,
  createFilePaths,
  getAllSources,
  yamlLoad
} from './utils.js'

/**
 * Glosario version of glossary.
 */
const GLOSARIO_URL = 'https://raw.githubusercontent.com/carpentries/glosario/master/glossary.yml'

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
  createFilePaths(options)
  download(options, GLOSARIO_URL).then(glosario => {
    const local = getGlossary(options)
    const merged = mergeGlossaries(glosario, local)
    const required = getRequired(options, merged)
    const filtered = filterGlossary(merged, required)
    const text = makeGloss(filtered)
    fs.writeFileSync(options.output, text, 'utf-8')
  }).catch(err => {
    console.error('GOT ERROR', err)
  })
}

/**
 * Build program options.
 * @returns {Object} Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  addCommonArguments(parser, '--input', '--output')
  parser.add_argument('--glosario', { action: 'store_true' })
  const fromArgs = parser.parse_args()
  return buildOptions(fromArgs)
}

/**
 * Get local glossary from file.
 * @param {Object} options Program options.
 * @returns {Object} All entries keyed by slug.
 */
const getGlossary = (options) => {
  return yamlLoad(options.input)
}

/**
 * Merge glossaries.
 * @param {Array<Array<Object>>} glossaries All glossaries.
 * @returns {Object} Merged glossary.
 */
const mergeGlossaries = (...glossaries) => {
  return glossaries.reduce((accum, current) => {
    current.forEach(item => {
      if (accum.hasOwnProperty(item.slug)) {
        if (('override' in item) && item.override) {
          // do nothing
        } else {
          console.error(`slug ${item.slug} is defined redundantly`)
        }
      }
      accum[item.slug] = item
    })
    return accum
  }, {})
}

/**
 * Get required keys from files.
 * @param {Object} options Program options.
 * @param {Object} gloss All glossary entries.
 */
const getRequired = (options, gloss) => {
  const pending = new Set(
    getAllSources(options).map(filename => {
      const text = fs.readFileSync(filename, 'utf-8')
      return [...text.matchAll(/<g\s+key="(.+?)">/g)]
        .map(match => match[1])
    }).flat()
  )
  const queue = [...pending]
  const result = new Set()
  while (queue.length > 0) {
    const key = queue.pop()
    pending.delete(key)
    result.add(key)
    if (!(key in gloss)) {
      console.error('MISSING', key)
    } else {
      try {
        const matches = [...gloss[key].en.def.matchAll(/\(#(.+?)\)/g)]
        matches.forEach(match => {
          const newKey = match[1]
          if (!result.has(newKey) && !pending.has(newKey)) {
            pending.add(newKey)
            queue.push(newKey)
          }
        })
      } catch (e) {
        console.error(`error processing key ${key}: ${e}`)
      }
    }
  }
  return result
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
const makeGloss = (data) => {
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
    } else if (leftTerm > rightTerm) {
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

/**
 * Create a promise for downloading a file from a URL.
 * @param {Object} options Program options.
 * @param {string} url What to download.
 * @returns {Promise} Something to wait on.
 */
const download = (options, url) => {
  return new Promise((resolve, reject) => {
    if (!options.glosario) {
      resolve({})
    }
    request(url, (error, response, body) => {
      if (error) {
        reject(error)
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Invalid response: status code <${response.statusCode}>`))
      }
      resolve(yaml.safeLoad(body))
    })
  })
}

// Run program.
main()
