#!/usr/bin/env node

'use strict'

import fs from 'fs'

/**
 * Maximum width of lines in code inclusions.
 */
const WIDTH = 70

/**
 * Main driver.
 */
const main = () => {
  process.argv.slice(2).forEach(filename => {
    fs.readFileSync(filename, 'utf-8')
      .split('\n')
      .forEach((line, i) => {
        line = line.trimEnd()
        if (line.length > WIDTH) {
          console.log(`${filename} ${i + 1} (${line.length})`)
        }
      })
  })
}

// Run program.
main()
