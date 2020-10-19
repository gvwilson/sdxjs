#!/usr/bin/env node

'use strict'

const argparse = require('argparse')
const assert = require('assert')
const fs = require('fs')
const parse5 = require('parse5')
const path = require('path')
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
  const options = getOptions()
  options.numbering = getNumbering(options)
  buildFilenames(options)
  options.entries.forEach(fileInfo => readFile(fileInfo))
  options.entries.forEach(fileInfo => {
    fileInfo.latex = htmlToLatex(options, fileInfo, fileInfo.doc, [])
  })
  const allLatex = options.entries.map(fileInfo => fileInfo.latex).flat().join('')
  options.head = fs.readFileSync(options.head, 'utf-8')
  options.foot = fs.readFileSync(options.foot, 'utf-8')
  const combined = `${options.head}\n${allLatex}\n${options.foot}`
  fs.writeFileSync(options.outputFile, combined, 'utf-8')
}

/**
 * Parse command-line arguments.
 * @returns {Object} options Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--config')
  parser.add_argument('--foot')
  parser.add_argument('--head')
  parser.add_argument('--htmlDir')
  parser.add_argument('--outputFile')
  parser.add_argument('--numbering')
  const fromArgs = parser.parse_args()
  return { ...fromArgs, ...yaml.safeLoad(fs.readFileSync(fromArgs.config)) }
}

/**
 * Get chapter numbering information.
 * @param {Object} options Program options.
 * @returns {Object} Numbering.
 */
const getNumbering = (options) => {
  const text = fs.readFileSync(options.numbering, 'utf-8')
  return JSON.parse(text)
}

/**
 * Convert options values into filenames.
 * @param {Object} options Program options.
 */
const buildFilenames = (options) => {
  options.entries = [...options.extras, ...options.chapters, ...options.appendices]
  options.entries.forEach(fileInfo => {
    if (fileInfo.slug === '/') {
      fileInfo.filename = path.join(options.htmlDir, 'index.html')
    } else {
      fileInfo.filename = path.join(options.htmlDir, fileInfo.slug, 'index.html')
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
  fileInfo.doc = parse5.parse(patched, { sourceCodeLocationInfo: true })
}

/**
 * Perform ugly patches on the HTML so that the LaTeX will come out right.
 * @param {string} html Input HTML.
 * @returns {string} Patched HTML.
 */
const patchHtml = (html) => {
  // \lede{} must come before \chapter{} so
  // <h1>...</h1> <p class="lede">...</p>
  // =>
  // <p class="lede">...</p> <h1>...</h1>
  if (html.includes('h1')) {
    if (html.includes('<p class="lede">')) {
      html = html.replace(/<h1>(.+?)<\/h1>\s+<p class="lede">(.+?)<\/p>/,
        '<p class="lede">$2</p>\n<h1>$1</h1>')
    } else {
      html = html.replace('<h1>', '<p class="lede"/><h1>')
    }
  }

  // Convert blockquotes that are styled like asides.
  // <blockquote><p><strong>...</strong></p> ... </blockquote>
  // =>
  // <blockquote class="aside"><p class="aside"><strong>...</strong></p> ... </blockquote>
  html = html.replace(/<blockquote>\s*<p><strong>(.+?)<\/strong><\/p>([^]+?)<\/blockquote>/g,
    (match, first, second) => {
      return `<blockquote class="aside"><p class="aside">${first}</p>${second}</blockquote>`
    })

  return html
}

/**
 * Translate a single HTML document to LaTeX.
 * @param {Object} options Program options.
 * @param {Object} fileInfo Information about this file.
 * @param {Object} node Root node of this conversion.
 * @param {Array} accum Strings generated so far.
 * @returns {Array<string>} All strings.
 */
const htmlToLatex = (options, fileInfo, node, accum) => {
  if (SKIP_ENTIRELY.has(node.nodeName)) {
    // do nothing
  } else if (RECURSE_ONLY.has(node.nodeName)) {
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
  } else if (node.nodeName === 'a') {
    accum.push('\\hreffoot{')
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
    accum.push('}{')
    accum.push(fullEscape(getAttr(node, 'href')))
    accum.push('}')
  } else if (node.nodeName === 'blockquote') {
    const cls = getAttr(node, 'class')
    if (cls === 'aside') {
      accum.push('\\begin{aside}')
      node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
      accum.push('\\end{aside}')
    } else {
      accum.push('\\begin{quotation}')
      node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
      accum.push('\\end{quotation}')
    }
  } else if (node.nodeName === 'cite') {
    accum.push('\\cite{')
    node.childNodes.forEach(child => htmlToText(child, accum, fullEscape))
    accum.push('}')
  } else if (node.nodeName === 'code') {
    accum.push('\\texttt{')
    node.childNodes.forEach(child => htmlToText(child, accum, fullEscape))
    accum.push('}')
  } else if (node.nodeName === 'div') {
    const cls = getAttr(node, 'class')
    if (cls === 'html-only') {
      // skip
    } else if (cls === 'latex-only') {
      node.childNodes.forEach(child => {
        assert(child.nodeName === '#text',
          'latex-only divs may only contain text')
        accum.push(child.value)
      })
    } else if (cls === 'subpage') {
      accum.push('\\begin{lstlisting}[caption=FIXME]\n')
      accum.push('FIXME display sub-page')
      accum.push('\\end{lstlisting}')
    } else {
      node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
    }
  } else if (node.nodeName === 'dd') {
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
  } else if (node.nodeName === 'dl') {
    const cls = getAttr(node, 'class')
    if (cls === 'bibliography') {
      accum.push('\\begin{thebibliography}{ABCD}')
      node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
      accum.push('\\end{thebibliography}')
    } else {
      accum.push('\\begin{description}')
      node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
      accum.push('\\end{description}')
    }
  } else if (node.nodeName === 'dt') {
    const cls = getAttr(node, 'class')
    if (cls === 'bibliography') {
      const key = getAttr(node, 'id')
      assert(key,
        'Every bibliography item must have an id')
      accum.push('\\bibitem{')
      accum.push(fullEscape(key))
      accum.push('}')
    } else if (cls === 'glossary') {
      const key = getAttr(node, 'id')
      assert(key,
        'Every glossary definition must have an id')
      accum.push('\\glossitem{')
      node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
      accum.push('}{')
      accum.push(fullEscape(key))
      accum.push('}')
    } else {
      accum.push('\\item[')
      node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
      accum.push(']')
    }
  } else if (node.nodeName === 'em') {
    accum.push('\\emph{')
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
    accum.push('}')
  } else if (node.nodeName === 'g') {
    accum.push('\\glossref{')
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
    accum.push('}{')
    accum.push(fullEscape(getAttr(node, 'key')))
    accum.push('}')
  } else if (node.nodeName === 'h1') {
    if ('latexBefore' in fileInfo) {
      accum.push(`${fileInfo.latexBefore}\n`)
    }
    if ('latexSkipChapter' in fileInfo) {
      // do nothing
    } else if (fileInfo.slug === '/') {
      accum.push('\\chapter{Introduction}\\label{introduction}')
    } else {
      accum.push('\\chapter{')
      node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
      accum.push('}\\label{')
      accum.push(fileInfo.slug)
      accum.push('}')
    }
  } else if (node.nodeName === 'h2') {
    accum.push('\\section{')
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
    accum.push('}')
  } else if (node.nodeName === 'h3') {
    accum.push('\\subsection*{')
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
    accum.push('}')
  } else if (node.nodeName === 'img') {
    const src = getAttr(node, 'src')
    accum.push(`\\image{${src}}`)
  } else if (node.nodeName === 'li') {
    accum.push('\\item ')
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
  } else if (node.nodeName === 'ol') {
    accum.push('\\begin{enumerate}')
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
    accum.push('\\end{enumerate}')
  } else if (node.nodeName === 'p') {
    const cls = getAttr(node, 'class')
    accum.push('\n')
    if (cls === 'lede') {
      accum.push('\\lede{')
      node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
      accum.push('}')
    } else if (cls === 'aside') {
      accum.push('\\asidetitle{')
      node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
      accum.push('}')
    } else {
      node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
    }
  } else if (node.nodeName === 'pre') {
    assert((node.childNodes.length === 1) && (node.childNodes[0].nodeName === 'code'),
      'Expect pre to have one code child')
    const title = getAttr(node, 'title')
    const caption = title ? `[caption={${title}}]` : ''
    accum.push(`\\begin{lstlisting}${caption}\n`)
    node.childNodes[0].childNodes.forEach(child => htmlToText(child, accum, nonAsciiEscape))
    accum.push('\\end{lstlisting}')
  } else if (node.nodeName === 'strong') {
    accum.push('\\textbf{')
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
    accum.push('}')
  } else if (node.nodeName === 'sub') {
    accum.push('\\textsubscript{')
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
    accum.push('}')
  } else if (node.nodeName === 'sup') {
    accum.push('\\textsuperscript{')
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
    accum.push('}')
  } else if (node.nodeName === 'table') {
    accum.push(tableToLatex(options, fileInfo, node))
  } else if (node.nodeName === 'td') {
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
  } else if (node.nodeName === 'th') {
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
  } else if (node.nodeName === 'ul') {
    accum.push('\\begin{itemize}')
    node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
    accum.push('\\end{itemize}')
  } else if (node.nodeName === 'xref') {
    const key = getAttr(node, 'key')
    assert(key in options.numbering,
           `Unknown cross-reference "${key}"`)
    const text = (options.numbering[key] < 'A') ? `\\chapref{${key}}` : `\\appref{${key}}`
    if (node.childNodes.length === 0) {
      accum.push(text)
    } else {
      node.childNodes.forEach(child => htmlToLatex(options, fileInfo, child, accum))
      accum.push(` (${text})`)
    }
  } else if (node.nodeName === '#text') {
    accum.push(fullEscape(node.value))
  } else {
    console.error('unknown', node.nodeName, fileInfo.filename, node.sourceCodeLocation.startLine)
    process.exit(1)
  }
  return accum
}

/**
 * Translate a single HTML table to LaTeX.
 * @param {Object} options Program options.
 * @param {Object} fileInfo Information about this file.
 * @param {Object} node Root node of this conversion.
 * @returns {string} Table as LaTeX.
 */
const tableToLatex = (options, fileInfo, node) => {
  assert(node.nodeName === 'table',
         `Calling tableToLatex with wrong node type "${node.nodeName}"`)
  const immediate = node.childNodes.filter(child => child.nodeName === 'tbody')
  assert(immediate.length === 1,
    'Table must contain one tbody')
  const rows = immediate[0].childNodes
    .filter(child => child.nodeName === 'tr')
    .map(row => row.childNodes.filter(cell => (cell.nodeName === 'td') || (cell.nodeName === 'th')))
  const lengths = rows.map(row => row.length)
  assert(lengths.every(len => len === lengths[0]),
    'Require all table rows to have the same number of cells')
  const spec = rows[0].map(x => 'l').join('')
  const body = rows.map(row => {
    const fields = row.map(cell => htmlToLatex(options, fileInfo, cell, []).flat().join(''))
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
  } else if ('childNodes' in node) {
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
