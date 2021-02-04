#!/usr/bin/env node
'use strict'

/**
 * Run style checks on chapter files.
 */

import argparse from 'argparse'
import fs from 'fs'
import glob from 'glob'
import htmlparser2 from 'htmlparser2'
import path from 'path'

import {
  WIDTH,
  getGlossaryReferences,
  loadConfig
} from './utils.js'

/**
 * Suffices of interesting included files.
 */
const SUFFIX = new Set(['.html', '.js', '.txt'])

/**
 * Main driver.
 */
const main = () => {
  const options = getOptions()
  const config = loadConfig(options.site, options.volume)

  checkExercises(config)

  const markdown = loadMarkdown(config)
  checkGlossDups(markdown)
  checkInclusions(markdown)
  checkLineEndings(markdown)

  const html = loadHtml(config, options.output)
  checkFigures(html)
  checkGlossRefs(html)
  checkTabs(html)
  checkWidths(html)
}

/**
 * Parse command-line arguments.
 * @returns {Object} options Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--site')
  parser.add_argument('--volume')
  parser.add_argument('--output')
  parser.add_argument('--slugs', { nargs: '+' })
  return parser.parse_args()
}

/**
 * Load Markdown for chapters.
 * @param {Object} config Program configuration.
 * @returns {Array<Object>} Filenames and text.
 */
const loadMarkdown = (config) => {
  const all = [...config.chapters, ...config.appendices]
  return all.map(entry => {
    const filename = `${entry.slug}/index.md`
    return {
      filename,
      text: fs.readFileSync(filename, 'utf-8').trim()
    }
  })
}

/**
 * Load HTML pages.
 * @param {Object} config Program configuration.
 * @param {string} output Output directory containing HTML files.
 * @returns {Array<Object>} Filenames, text, and DOM.
 */
const loadHtml = (config, output) => {
  const all = [...config.chapters, ...config.appendices]
  return all.map(entry => {
    const filename = `${output}/${entry.slug}/index.html`
    const text = fs.readFileSync(filename, 'utf-8').trim()
    const doc = htmlparser2.parseDOM(text)[0]
    return {
      filename,
      text,
      doc
    }
  })
}

/**
 * Check for mis-matches in exercise directories.
 * @param {Object} options Program options.
 */
const checkExercises = (options) => {
  const kinds = ['problem', 'solution']
  kinds.forEach(kind => {
    const expected = new Set()
    const actual = new Set()
    options.chapters.forEach(chapter => {
      if ('exercises' in chapter) {
        chapter.exercises.map(ex => expected.add(ex[kind]))
      }
      glob.sync(`${chapter.slug}/x-*/${kind}.md`)
        .forEach(ex => actual.add(ex))
    })
    showSetDiff(`Missing ${kind}`, expected, actual)
    showSetDiff(`Unused ${kind}`, actual, expected)
  })
}

/**
 * Check figure cross-references.
 * @param {Array<Object>} html HTML file information.
 */
const checkFigures = (html) => {
  // How to traverse tree.
  const recurse = (node, defined, used) => {
    if (node.type !== 'tag') {
      // do nothing
    } else if (node.name === 'figure') {
      defined.add(node.attribs.id)
    } else if (node.name === 'f') {
      used.add(node.attribs.key)
    } else {
      node.children.forEach(child => recurse(child, defined, used))
    }
  }

  // Check each file.
  const defined = new Set()
  const used = new Set()
  html.forEach(entry => {
    recurse(entry.doc, defined, used)
  })
  showSetDiff('Unused figure references', defined, used)
  showSetDiff('Unresolved figure references', used, defined)
}

/**
 * Check glossary references and entries.
 * @param {Array<Object>} html HTML file information.
 */
const checkGlossRefs = (html) => {
  const used = new Set(html.map(({ text }) => getGlossaryReferences(text)).flat())
  const defined = new Set(html.map(({ text }) => {
    const matches = [...text.matchAll(/<dt\s+id="(.+?)"\s+class="glossary">/g)]
    return matches.map(match => match[1])
  }).flat())
  showSetDiff('Glossary used but not defined', used, defined)
  showSetDiff('Glossary defined but not used', defined, used)
}

/**
 * Check for duplicate glossary references within individual files.
 * @param {Array<Object>} markdown Markdown file information.
 */
const checkGlossDups = (markdown) => {
  markdown.forEach(({ filename, text }) => {
    if (!filename.includes('gloss')) {
      const refs = getGlossaryReferences(text)
      const seen = new Set()
      refs.forEach(key => {
        if (seen.has(key)) {
          console.log(`${filename} defines ${key} multiple times`)
        } else {
          seen.add(key)
        }
      })
    }
  })
}

/**
 * Check file inclusions.
 * @param {Array<Object>} files File information.
 */
const checkInclusions = (markdown) => {
  const existing = new Set()
  const included = new Set()
  markdown.forEach(({ filename, text }) => {
    glob.sync(`${path.dirname(filename)}/*.*`)
      .filter(f => SUFFIX.has(path.extname(f)))
      .forEach(f => existing.add(f))
    getIncluded(filename, text).forEach(filename => included.add(filename))
  })
  showSetDiff('In directories but not included', existing, included)
}

/**
 * Check for Windows line endings in source files.
 * @param {Array<Object>} files File information.
 */
const checkLineEndings = (files) => {
  const windows = files.filter(({ text }) => text.includes('\r'))
  if (windows.length > 0) {
    const filenames = windows.map(({ filename }) => filename).join('\n- ')
    console.log(`file(s) contain Windows line endings\n- ${filenames}`)
  }
}

/**
 * Check for tabs in source files.
 * @param {Array<Object>} html HTML file information.
 */
const checkTabs = (html) => {
  html.forEach(({ filename, text }) => {
    for (const c of text) {
      if (c === '\t') {
        console.log(`${filename} contains tabs`)
        return
      }
    }
  })
}

/**
 * Check widths of code inclusions.
 * @param {Array<Object>} html HTML file information.
 */
const checkWidths = (html) => {
  const counts = html.reduce((accum, { filename, text }) => {
    const matches = [...text.matchAll(/<pre\s+title="(.+?)"><code.+?>([^]+?)<\/code><\/pre>/g)]
    const num = matches.reduce((accum, [match, title, body]) => {
      const lines = body.split('\n').filter(line => line.trimEnd().length > WIDTH)
      return accum + lines.length
    }, 0)
    accum[filename] = num
    return accum
  }, {})
  const oversize = Object.keys(counts).filter(filename => counts[filename] > 0).sort()
  if (oversize.length > 0) {
    const result = oversize.map(filename => `${filename}: ${counts[filename]}`).join('\n- ')
    console.log(`Over-length code lines:\n- ${result}`)
  }
}

/**
 * Get all the files included in a Markdown file.
 * @param {string} filename Which file.
 * @param {string} text Body of file.
 * @returns {Set} Set of included files.
 */
const getIncluded = (filename, text) => {
  const result = new Set()
  const base = path.dirname(filename)
  const matches = [...text.matchAll(/<%-\s+include\('\/inc\/(.+?).html',\s*{(.+?)}\s*\)\s*%>/g)]
  matches.forEach(match => {
    if (match[1] === 'multi') {
      const pair = match[2].match(/pat:\s*'(.+?)',\s*fill:\s*'(.+?)'/)
      const pat = pair[1]
      pair[2].split(' ').forEach(fill => {
        const full = path.join(base, pat.replace('*', fill))
        result.add(full)
      })
    } else {
      const f = match[2].match(/file:\s*'(.+?)'/)
      if (f) {
        const full = path.join(base, f[1])
        result.add(full)
      }
    }
  })
  return result
}

/**
 * Show differences (if any) between two sets.
 * @param {string} title Title string.
 * @param {Set} left One set.
 * @param {Set} right Other set.
 */
const showSetDiff = (title, left, right) => {
  const diff = Array.from(left).filter(item => !right.has(item)).sort()
  if (diff.length > 0) {
    console.log(`${title}\n- ${diff.join('\n- ')}`)
  }
}

// Run program.
main()
