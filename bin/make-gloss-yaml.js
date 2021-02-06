#!/usr/bin/env node
'use strict'

/**
 * Create a glossary by merging web entries with local entries and filtering for
 * terms that are actually needed (transitively).
 */

import argparse from 'argparse'
import fs from 'fs'
import MarkdownIt from 'markdown-it'
import request from 'request'
import yaml from 'js-yaml'

import {
  getGlossaryReferences,
  loadYaml,
  saveYaml
} from './utils.js'

/**
 * Glosario version of glossary.
 */
const GLOSARIO_URL = 'https://raw.githubusercontent.com/carpentries/glosario/master/glossary.yml'

/**
 * Fields to keep in final glossary entries.
 */
const FIELDS = ['slug', 'en', 'ref']

/**
 * Main driver.
 */
const main = () => {
  const options = getOptions()
  download(options, GLOSARIO_URL).then(glosario => {
    const local = loadYaml(options.input)
    const merged = mergeGlossaries(glosario, local)
    const required = getRequired(options, merged)
    if (required !== null) {
      const cleaned = cleanGlossary(merged, required)
      const reverseKeys = (left, right) => left < right ? 1 : -1
      saveYaml(options.output, cleaned, { sortKeys: reverseKeys })
    }
  }).catch(err => {
    console.error('Error building glossary', err)
  })
}

/**
 * Build program options.
 * @returns {Object} Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--input')
  parser.add_argument('--yaml')
  parser.add_argument('--output')
  parser.add_argument('--glosario', { action: 'store_true' })
  parser.add_argument('--files', { nargs: '+' })
  return parser.parse_args()
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
        console.error(`slug ${item.slug} defined redundantly`)
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
    options.files.map(filename => {
      const text = fs.readFileSync(filename, 'utf-8')
      const refs = getGlossaryReferences(text)
      return refs
    }).flat()
  )
  const queue = [...pending]
  const result = new Set()
  let successful = true
  while (queue.length > 0) {
    const key = queue.pop()
    pending.delete(key)
    result.add(key)
    if (!(key in gloss)) {
      console.error('MISSING', key)
      successful = false
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
  return successful ? result : null
}

/**
 * Clean up required glossary entries.
 * @param {Object} glossary Entire glossary (keyed by slug).
 * @param {Set} keep Keys of items to keep.
 * @returns {Array<Object>} Subset of glossary as array in slug order.
 */
const cleanGlossary = (glossary, keep) => {
  const result = []
  keep = Array.from(keep).sort()
  keep.forEach(key => {
    const entry = {}
    FIELDS.forEach(f => {
      if (f in glossary[key]) {
        entry[f] = glossary[key][f]
      }
    })
    result.push(entry)
  })
  return result.sort((left, right) => left.slug < right.slug ? -1 : 1)
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
      resolve([])
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
