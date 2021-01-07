#!/usr/bin/env node

'use strict'

import fs from 'fs'

import {
  getGlossaryReferences
} from './utils.js'

const main = () => {
  const defined = new Map()
  process.argv.slice(2).forEach(filename => {
    const terms = findTerms(filename)
    if (terms.size > 0) {
      console.log(`- ${filename}`)
      const sorted = [...terms].sort()
      sorted.forEach(term => {
        console.log(`  - ${term}`)
        if (!defined.has(term)) {
          defined.set(term, [])
        }
        defined.get(term).push(filename)
      })
    }
  })

  console.log()
  const terms = [...defined.keys()].sort()
  terms.forEach(term => {
    if (defined.get(term).length > 1) {
      console.log(`${term}: ${defined.get(term).join(', ')}`)
    }
  })
}

const findTerms = (filename) => {
  const text = fs.readFileSync(filename, 'utf-8')
  return new Set(getGlossaryReferences(text))
}

main()
