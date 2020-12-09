#!/usr/bin/env node

'use strict'

import fs from 'fs'
import htmlparser2 from 'htmlparser2'

/**
 * Main driver.
 */
const main = () => {
  const filenames = process.argv.slice(2)
  filenames.forEach(filename => {
    search(filename)
  })
}

/**
 * Report chunk lengths in a file.
 * @param {string} filename File to search.
 */
const search = (filename) => {
  const text = fs.readFileSync(filename, 'utf-8').trim()
  const doc = htmlparser2.parseDOM(text)[0]
  recurse(filename, doc)
}

/**
 * Look for `pre` nodes containing `code` nodes.
 * @param {Object} node Current node.
 */
const recurse = (filename, node) => {
  if (node.type !== 'tag') {
    return
  }
  if (node.name === 'pre') {
    if ('title' in node.attribs) {
      const title = node.attribs.title
      const code = node.children[0]
      if ((code.type === 'tag') && (code.name === 'code')) {
        if (code.children.length === 0) {
          console.log('--', filename, title)
        } else {
          const text = code.children[0]
          if (text.type === 'text') {
            const num = text.data.split('\n').length - 1
            console.log(num, filename, title)
          }
        }
      }
    }
  }
  node.children.forEach(child => recurse(filename, child))
}

main()
