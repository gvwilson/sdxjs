#!/usr/bin/env node

'use strict'

const argparse = require('argparse')
const assert = require('assert')
const fs = require('fs')
const parse5 = require('parse5')
const path = require('path')
const util = require('util')
const yaml = require('js-yaml')

/**
 * Nodes to skip entirely.
 */
const SKIP_ENTIRELY = new Set('#comment head footer nav'.split(' '))

/**
 * Nodes to recurse through.
 */
const RECURSE_ONLY = new Set('#document html body main'.split(' '))

/**
 * Main driver.
 */
const main = () => {
  const config = getConfiguration()
  config.numbering = getNumbering(config)
  buildFilenames(config)
  config.entries.forEach(fileInfo => readFile(fileInfo))
  config.entries.forEach(fileInfo => {
    fileInfo.latex = htmlToLatex(config, fileInfo, fileInfo.doc, [])
  })
  const allLatex = config.entries.map(fileInfo => fileInfo.latex).flat().join('')
  config.head = fs.readFileSync(config.head, 'utf-8')
  config.foot = fs.readFileSync(config.foot, 'utf-8')
  const combined = `${config.head}\n${allLatex}\n${config.foot}`
  fs.writeFileSync(config.outputFile, combined, 'utf-8')
}

/**
 * Parse command-line arguments.
 * @returns {Object} config Program configuration.
 */
const getConfiguration = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--config')
  parser.add_argument('--foot')
  parser.add_argument('--head')
  parser.add_argument('--htmlDir')
  parser.add_argument('--outputFile')
  parser.add_argument('--numbering')
  const fromArgs = parser.parse_args()
  return {...fromArgs, ...yaml.safeLoad(fs.readFileSync(fromArgs.config))}
}

/**
 * Get chapter numbering information.
 * @param {Object} config Program configuration.
 * @returns {Object} Numbering.
 */
const getNumbering = (config) => {
  const text = fs.readFileSync(config.numbering, 'utf-8')
  return JSON.parse(text)
}

/**
 * Convert configuration values into filenames.
 * @param {Object} config Program configuration.
 */
const buildFilenames = (config) => {
  config.entries = [...config.extras, ...config.chapters, ...config.appendices]
  config.entries.forEach(fileInfo => {
    if (fileInfo.slug === '/') {
      fileInfo.filename = path.join(config.htmlDir, 'index.html')
    }
    else {
      fileInfo.filename = path.join(config.htmlDir, fileInfo.slug, 'index.html')
    }
  })
}

/**
 * Load required HTML from files.
 * @param {Object} fileInfo Information about file (so far).
 */
const readFile = (fileInfo) => {
  const text = fs.readFileSync(fileInfo.filename, 'utf-8').trim()
  const patched = patchHtml(text)
  fileInfo.doc = parse5.parse(patched, {sourceCodeLocationInfo: true})
}

/**
 * Perform ugly patches on the HTML so that the LaTeX will come out right.
 * (\lede{} must come before \chapter{}).
 * @param {string} raw Original HTML.
 * @returns {string} Patched HTML.
 */
const patchHtml = (raw) => {
  if (!raw.includes('h1')) {
    return raw
  }
  if (!raw.includes('<p class="lede">')) {
    return raw.replace('<h1>', '<p class="lede"/><h1>')
  }
  return raw.replace(/<h1>(.+?)<\/h1>\s+<p class="lede">(.+?)<\/p>/,
                     '<p class="lede">$2</p>\n<h1>$1</h1>')
}

/**
 * Translate a single HTML document to LaTeX.
 * @param {Object} config Program configuration.
 * @param {Object} fileInfo Information about this file.
 * @param {Object} node Root node of this conversion.
 * @param {Array} accum Strings generated so far.
 * @returns {Array<string>} All strings.
 */
const htmlToLatex = (config, fileInfo, node, accum) => {
  if (SKIP_ENTIRELY.has(node.nodeName)) {
    // do nothing
  }
  else if (RECURSE_ONLY.has(node.nodeName)) {
    node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
  }
  else if (node.nodeName === 'a') {
    accum.push('\\hreffoot{')
    node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
    accum.push('}{')
    accum.push(fullEscape(getAttr(node, 'href')))
    accum.push('}')
  }
  else if (node.nodeName === 'blockquote') {
    accum.push('\\begin{quotation}')
    node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
    accum.push('\\end{quotation}')
  }
  else if (node.nodeName === 'cite') {
    accum.push('\\cite{')
    node.childNodes.forEach(child => htmlToText(child, accum, fullEscape))
    accum.push('}')
  }
  else if (node.nodeName === 'code') {
    accum.push('\\texttt{')
    node.childNodes.forEach(child => htmlToText(child, accum, fullEscape))
    accum.push('}')
  }
  else if (node.nodeName === 'div') {
    const cls = getAttr(node, 'class')
    if (cls === 'html-only') {
      // skip
    }
    else {
      node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
    }
  }
  else if (node.nodeName === 'dd') {
    node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
  }
  else if (node.nodeName === 'dl') {
    const cls = getAttr(node, 'class')
    if (cls === 'bibliography') {
      accum.push('\\begin{thebibliography}{ABCD}')
      node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
      accum.push('\\end{thebibliography}')
    }
    else {
      accum.push('\\begin{description}')
      node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
      accum.push('\\end{description}')
    }
  }
  else if (node.nodeName === 'dt') {
    const cls = getAttr(node, 'class')
    if (cls === 'bibliography') {
      const key = getAttr(node, 'id')
      assert(key,
             `Every bibliography item must have an id`)
      accum.push('\\bibitem{')
      accum.push(fullEscape(key))
      accum.push('}')
    }
    else if (cls === 'glossary') {
      const key = getAttr(node, 'id')
      assert(key,
             `Every glossary definition must have an id`)
      accum.push('\\glossitem{')
      node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
      accum.push('}{')
      accum.push(fullEscape(key))
      accum.push('}')
    }
    else {
      accum.push('\\item[')
      node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
      accum.push(']')
    }
  }
  else if (node.nodeName === 'em') {
    accum.push('\\emph{')
    node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
    accum.push('}')
  }
  else if (node.nodeName === 'g') {
    accum.push('\\glossref{')
    node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
    accum.push('}{')
    accum.push(fullEscape(getAttr(node, 'key')))
    accum.push('}')
  }
  else if (node.nodeName === 'h1') {
    if (fileInfo.slug === '/') {
      accum.push('\\chapter{Introduction}\\label{introduction}')
    }
    else {
      accum.push('\\chapter{')
      node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
      accum.push('}\\label{')
      accum.push(fileInfo.slug)
      accum.push('}')
    }
  }
  else if (node.nodeName === 'h2') {
    accum.push(`\\section{`)
    node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
    accum.push('}')
  }
  else if (node.nodeName === 'img') {
    const src = getAttr(node, 'src')
    accum.push(`\\image{${src}}`)
  }
  else if (node.nodeName === 'li') {
    accum.push(`\\item `)
    node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
  }
  else if (node.nodeName === 'ol') {
    accum.push(`\\begin{enumerate}`)
    node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
    accum.push(`\\end{enumerate}`)
  }
  else if (node.nodeName === 'p') {
    const cls = getAttr(node, 'class')
    accum.push(`\n`)
    if (cls === 'lede') {
      accum.push('\\lede{')
      node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
      accum.push('}')
    }
    else {
      node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
    }
  }
  else if (node.nodeName === 'pre') {
    assert((node.childNodes.length === 1) && (node.childNodes[0].nodeName === 'code'),
           `Expect 'pre' to have one 'code' child`)
    const title = getAttr(node, 'title')
    const caption = title ? `[caption={${title}}]` : ``
    accum.push(`\\begin{lstlisting}${caption}\n`)
    node.childNodes[0].childNodes.forEach(child => htmlToText(child, accum, nonAsciiEscape))
    accum.push('\\end{lstlisting}')
  }
  else if (node.nodeName === 'strong') {
    accum.push('\\textbf{')
    node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
    accum.push('}')
  }
  else if (node.nodeName === 'table') {
    accum.push(tableToLatex(config, fileInfo, node))
  }
  else if (node.nodeName === 'td') {
    node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
  }
  else if (node.nodeName === 'th') {
    node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
  }
  else if (node.nodeName === 'ul') {
    accum.push(`\\begin{itemize}`)
    node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
    accum.push(`\\end{itemize}`)
  }
  else if (node.nodeName === 'xref') {
    const key = getAttr(node, 'key')
    assert(key in config.numbering,
           `Unknown cross-reference "${key}"`)
    const text = (config.numbering[key] < 'A') ? `\\chapref{${key}}` : `\\appref{${key}}`
    if (node.childNodes.length === 0) {
      accum.push(text)
    }
    else {
      node.childNodes.forEach(child => htmlToLatex(config, fileInfo, child, accum))
      accum.push(` (${text})`)
    }
  }
  else if (node.nodeName === '#text') {
    accum.push(fullEscape(node.value))
  }
  else {
    console.error('unknown', node.nodeName, fileInfo.filename, node.sourceCodeLocation.startLine)
    process.exit(1)
  }
  return accum
}

/**
 * Translate a single HTML table to LaTeX.
 * @param {Object} config Program configuration.
 * @param {Object} fileInfo Information about this file.
 * @param {Object} node Root node of this conversion.
 * @returns {string} Table as LaTeX.
 */
const tableToLatex = (config, fileInfo, node) => {
  assert(node.nodeName === 'table',
         `Calling tableToLatex with wrong node type "${node.nodeName}"`)
  const immediate = node.childNodes.filter(child => child.nodeName === 'tbody')
  assert(immediate.length === 1,
         `Table must contain one tbody`)
  const rows = immediate[0].childNodes
        .filter(child => child.nodeName === 'tr')
        .map(row => row.childNodes.filter(cell => (cell.nodeName === 'td') || (cell.nodeName === 'th')))
  const lengths = rows.map(row => row.length)
  assert(lengths.every(len => len === lengths[0]),
         `Require all table rows to have the same number of cells`)
  const spec = rows[0].map(x => 'l').join('')
  const body = rows.map(row => {
    const fields = row.map(cell => htmlToLatex(config, fileInfo, cell, []).flat().join(''))
    const joined = fields.join(' & ')
    return `${joined} \\\\\n`
  }).join('')
  return `\\begin{tabular}{${spec}}\n${body}\\end{tabular}\n`
}

/**
 * Translate a single HTML document to text (for use in code blocks).
 * @param {string} html What to translate.
 * @param {function} escape How to escape strings.
 * @returns {string} LaTeX.
 */
const htmlToText = (node, accum, escape) => {
  if (node.nodeName === '#text') {
    accum.push(escape(node.value))
  }
  else if ('childNodes' in node) {
    node.childNodes.forEach(child => htmlToText(child, accum, escape))
  }
  return accum
}

/**
 * Escape all special LaTeX characters in tex.
 * @param {string} text What to escape.
 * @returns {string} Result.
 */
const fullEscape = (text) => {
  const result = text
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}')
        .replace(/\$/g, '\\$')
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_')
        .replace(/#/g, '\\#')
  return nonAsciiEscape(result)
}

/**
 * Escape non-ASCII characters.
 * @param {string} text What to escape.
 * @returns {string} Result.
 */
const nonAsciiEscape = (text) => {
  return text
    .replace(/…/g, '{\\ldots}')
    .replace(/✓/g, '{\\checkmark}')
    .replace(/«/g, '{\\guillemotleft}')
    .replace(/»/g, '{\\guillemotright}')
    .replace(/©/g, '{\\textcopyright}')
}

/**
 * Get attribute from node.
 * @param {Object} node Node to search.
 * @param {string} name Attribute name.
 * @returns {string} Attribute value or null.
 */
const getAttr = (node, name) => {
  const found = node.attrs.filter(attr => (attr.name === name))
  assert(found.length < 2,
         `Node has multiple attributes ${name}`)
  return (found.length === 0) ? null : found[0].value
}

// Run program.
main()
