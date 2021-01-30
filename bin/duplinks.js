#!/usr/bin/env node

'use strict'

import fs from 'fs'

/**
 * Main driver.
 */
const main = () => {
  const filenames = process.argv.slice(2)
  filenames.forEach(filename => {
    const raw = fs.readFileSync(filename, 'utf-8')
    const text = stripCode(raw)
    const matches = [...text.matchAll(/\[.+?\]\[(.+?)\]/g)]
      .map(m => m[1])
    const duplicates = findDuplicates(matches)
    report(filename, duplicates)
  })
}

/**
 * Strip code elements from Markdown text.
 * @param {string} raw Raw text.
 * @returns {String} Stripped text.
 */
const stripCode = (raw) => {
  return raw
    .replace(/```.+?```/gm, '')
    .replace(/`.+?`/gm, '')
}

/**
 * Find duplicates in a list of strings.
 * @param {Array<string>} allTerms Text to search.
 * @returns {Array<string>} Sorted list of duplicates.
 */
const findDuplicates = (allTerms) => {
  const seen = new Set()
  const result = []
  allTerms.forEach(term => {
    if (seen.has(term)) {
      result.push(term)
    }
    seen.add(term)
  })
  return result.sort()
}

/**
 * Report any duplicated link targets by file.
 * @param {string} filename File containing links.
 * @param {Array<string>} duplicates What to report (if anything).
 */
const report = (filename, duplicates) => {
  if (duplicates.length > 0) {
    console.log(filename)
    duplicates.forEach(dup => {
      console.log(`- ${dup}`)
    })
  }
}

main()
