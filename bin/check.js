#!/usr/bin/env node

'use strict'

const argparse = require('argparse')
const fs = require('fs')
const glob = require('glob')
const parse5 = require('parse5')
const path = require('path')
const yaml = require('js-yaml')

/**
 * Suffices of interesting included files.
 */
const SUFFIX = new Set(['.html', '.js', '.sh', '.text'])

/**
 * Main driver.
 */
const main = () => {
  const config = getConfiguration()
  const markdown = loadMarkdown(config)
  const html = loadHtml(config)
  checkInclusions(markdown)
  checkGloss(html)
}

/**
 * Parse command-line arguments.
 * @returns {Object} config Program configuration.
 */
const getConfiguration = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--html', {nargs: '+'})
  parser.add_argument('--markdown', {nargs: '+'})
  return parser.parse_args()
}

/**
 * Load Markdown.
 * @param {Object} config Program configuration.
 * @returns {Array<Object>} Filenames and text.
 */
const loadMarkdown = (config) => {
  return config.markdown.map(filename => {
    const text = fs.readFileSync(filename, 'utf-8').trim()
    return {filename, text}
  })
}

/**
 * Load HTML.
 * @param {Object} config Program configuration.
 * @returns {Array<Object>} Filenames, text, and DOM.
 */
const loadHtml = (config) => {
  return config.html.map(filename => {
    const text = fs.readFileSync(filename, 'utf-8').trim()
    const doc = parse5.parse(text, {sourceCodeLocationInfo: true})
    return {filename, text, doc}
  })
}

/**
 * Check glossary references and entries.
 * @param {Array<Object>} files File information.
 */
const checkGloss = (files) => {
  const used = new Set(files.map(({text}) => {
    const matches = [...text.matchAll(/<g\s+key="(.+?)">/g)]
    return matches.map(match => match[1])
  }).flat())
  const defined = new Set(files.map(({text}) => {
    const matches = [...text.matchAll(/<dt\s+id="(.+?)"\s+class="glossary">/g)]
    return matches.map(match => match[1])
  }).flat())
  showSetDiff('glossary used but not defined', used, defined)
  showSetDiff('glossary defined but not used', defined, used)
}

/**
 * Check file inclusions.
 * @param {Array<Object>} files File information.
 */
const checkInclusions = (files) => {
  files.forEach(({filename, text}) => {
    const existing = glob.sync(`${path.dirname(filename)}/*.*`)
          .filter(f => SUFFIX.has(path.extname(f)))
    const included = getIncluded(filename, text)
    showSetDiff('in directory but not included', existing, included)
  })
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
    if ((match[1] === 'code') || (match[1] === 'html')){
      const f = match[2].match(/file:\s*'(.+?)'/)[1]
      const full = path.join(base, f)
      result.add(full)
    }
    else if (match[1] === 'multi') {
      const pair = match[2].match(/pat:\s*'(.+?)',\s*fill:\s*'(.+?)'/)
      const pat = pair[1]
      pair[2].split(' ').forEach(fill => {
        const full = path.join(base, pat.replace('*', fill))
        result.add(full)
      })
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
