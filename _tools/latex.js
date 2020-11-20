#!/usr/bin/env node

'use strict'

const argparse = require('argparse')
const assert = require('assert')
const fs = require('fs')
const htmlparser2 = require('htmlparser2')
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
  return { ...fromArgs, ...yaml.safeLoad(fs.readFileSync(fromArgs.config, 'utf-8')) }
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
  fileInfo.doc = htmlparser2.parseDOM(patched)[0]
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
  // <div class="callout"><h3>...</h3> ... </div>
  // =>
  // <div class="callout"><h3 class="callout">...</h3> ... </div>
  html = html.replace(/<div\s+class="callout">\s*<h3>(.+?)<\/h3>([^]+?)<\/div>/g,
    (match, first, second) => {
      return `<div class="callout"><h3 class="callout">${first}</h3>${second}</div>`
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
  if (node.type === 'text') {
    accum.push(fullEscape(node.data))
  } else if (node.type !== 'tag') {
    assert(false, `unknown node type ${node.type}`)
  } else if (SKIP_ENTIRELY.has(node.name)) {
    // do nothing
  } else if (RECURSE_ONLY.has(node.name)) {
    childrenToLatex(options, fileInfo, node, accum)
  } else if (node.name === 'a') {
    assert('href' in node.attribs,
           `link without href at ${fileInfo.filename} ${node.startIndex}`)
    accum.push('\\hreffoot{')
    childrenToLatex(options, fileInfo, node, accum)
    accum.push('}{')
    accum.push(fullEscape(node.attribs.href))
    accum.push('}')
  } else if (node.name === 'blockquote') {
    accum.push('\\begin{quotation}')
    childrenToLatex(options, fileInfo, node, accum)
    accum.push('\\end{quotation}')
  } else if (node.name === 'cite') {
    accum.push('\\cite{')
    node.children.forEach(child => htmlToText(child, accum, fullEscape))
    accum.push('}')
  } else if (node.name === 'code') {
    accum.push('\\texttt{')
    node.children.forEach(child => htmlToText(child, accum, fullEscape))
    accum.push('}')
  } else if (node.name === 'div') {
    const cls = node.attribs.class
    if (cls === 'html-only') {
      // skip
    } else if (cls === 'latex-only') {
      node.children.forEach(child => {
        assert(child.type === 'text',
          'latex-only divs may only contain text')
        accum.push(child.data)
      })
    } else if (cls === 'callout') {
      accum.push('\\begin{callout}')
      childrenToLatex(options, fileInfo, node, accum)
      accum.push('\\end{callout}')
    } else if (cls === 'centered') {
      accum.push('\n{\\centering\n')
      childrenToLatex(options, fileInfo, node, accum)
      accum.push('\n}\n')
    } else if (cls === 'fixme') {
      accum.push('\\fixme{')
      childrenToLatex(options, fileInfo, node, accum)
      accum.push('}')
    } else if (cls === 'hint') {
      accum.push('\\begin{hint}')
      childrenToLatex(options, fileInfo, node, accum)
      accum.push('\\end{hint}')
    } else if (cls === 'subpage') {
      accum.push('\\begin{lstlisting}[caption=FIXME]\n')
      accum.push('FIXME display sub-page')
      accum.push('\\end{lstlisting}')
    } else {
      childrenToLatex(options, fileInfo, node, accum)
    }
  } else if (node.name === 'dd') {
    childrenToLatex(options, fileInfo, node, accum)
  } else if (node.name === 'dl') {
    const cls = node.attribs.class
    if (cls === 'bibliography') {
      accum.push('\\begin{thebibliography}{ABCD}')
      childrenToLatex(options, fileInfo, node, accum)
      accum.push('\\end{thebibliography}')
    } else {
      accum.push('\\begin{description}')
      childrenToLatex(options, fileInfo, node, accum)
      accum.push('\\end{description}')
    }
  } else if (node.name === 'dt') {
    const cls = node.attribs.class
    if (cls === 'bibliography') {
      const key = node.attribs.id
      assert(key,
        'Every bibliography item must have an id')
      accum.push('\\bibitem{')
      accum.push(fullEscape(key))
      accum.push('}')
    } else if (cls === 'glossary') {
      const key = node.attribs.id
      assert(key,
        'Every glossary definition must have an id')
      accum.push('\\glossitem{')
      childrenToLatex(options, fileInfo, node, accum)
      accum.push('}{')
      accum.push(fullEscape(key))
      accum.push('}')
    } else {
      accum.push('\\item[')
      childrenToLatex(options, fileInfo, node, accum)
      accum.push(']')
    }
  } else if (node.name === 'em') {
    accum.push('\\emph{')
    childrenToLatex(options, fileInfo, node, accum)
    accum.push('}')
  } else if (node.name === 'g') {
    accum.push('\\glossref{')
    childrenToLatex(options, fileInfo, node, accum)
    accum.push('}{')
    accum.push(fullEscape(node.attribs.key))
    accum.push('}')
  } else if (node.name === 'h1') {
    if ('latexBefore' in fileInfo) {
      accum.push(`${fileInfo.latexBefore}\n`)
    }
    if ('latexSkipChapter' in fileInfo) {
      // do nothing
    } else if (fileInfo.slug === '/') {
      accum.push('\\chapter{Introduction}\\label{introduction}')
    } else {
      accum.push('\\chapter{')
      childrenToLatex(options, fileInfo, node, accum)
      accum.push('}\\label{')
      accum.push(fileInfo.slug)
      accum.push('}')
    }
  } else if (node.name === 'h2') {
    const cls = node.attribs.class
    if (cls === 'lede') {
      accum.push('\n\\lede{')
      childrenToLatex(options, fileInfo, node, accum)
      accum.push('}')
    } else {
      accum.push('\\section{')
      childrenToLatex(options, fileInfo, node, accum)
      accum.push('}')
    }
  } else if (node.name === 'h3') {
    const cls = node.attribs.class
    if (cls === 'callout') {
      accum.push('\\callouttitle{')
      childrenToLatex(options, fileInfo, node, accum)
      accum.push('}')
    } else {
      accum.push('\\subsection*{')
      childrenToLatex(options, fileInfo, node, accum)
      accum.push('}')
    }
  } else if (node.name === 'img') {
    const src = node.attribs.src
    accum.push(`\\image{${src}}`)
  } else if (node.name === 'key') {
    accum.push('\\keystroke{')
    childrenToLatex(options, fileInfo, node, accum)
    accum.push('}')
  } else if (node.name === 'li') {
    accum.push('\\item ')
    childrenToLatex(options, fileInfo, node, accum)
  } else if (node.name === 'ol') {
    accum.push('\\begin{enumerate}')
    childrenToLatex(options, fileInfo, node, accum)
    accum.push('\\end{enumerate}')
  } else if (node.name === 'p') {
    const cls = node.attribs.class
    accum.push('\n')
    if (cls === 'noindent') {
      accum.push('\\noindent\n')
    }
    childrenToLatex(options, fileInfo, node, accum)
  } else if (node.name === 'pre') {
    assert((node.children.length === 1) && (node.children[0].name === 'code'),
      'Expect pre to have one code child')
    const title = node.attribs.title
    const caption = title ? `[caption={${title}}]` : ''
    accum.push(`\\begin{lstlisting}${caption}\n`)
    node.children[0].children.forEach(child => htmlToText(child, accum, nonAsciiEscape))
    accum.push('\\end{lstlisting}')
  } else if (node.name === 'strong') {
    accum.push('\\textbf{')
    childrenToLatex(options, fileInfo, node, accum)
    accum.push('}')
  } else if (node.name === 'sub') {
    accum.push('\\textsubscript{')
    childrenToLatex(options, fileInfo, node, accum)
    accum.push('}')
  } else if (node.name === 'sup') {
    accum.push('\\textsuperscript{')
    childrenToLatex(options, fileInfo, node, accum)
    accum.push('}')
  } else if (node.name === 'table') {
    accum.push(tableToLatex(options, fileInfo, node))
  } else if (node.name === 'td') {
    childrenToLatex(options, fileInfo, node, accum)
  } else if (node.name === 'th') {
    childrenToLatex(options, fileInfo, node, accum)
  } else if (node.name === 'ul') {
    accum.push('\\begin{itemize}')
    childrenToLatex(options, fileInfo, node, accum)
    accum.push('\\end{itemize}')
  } else if (node.name === 'xref') {
    const key = node.attribs.key
    assert(key in options.numbering,
           `Unknown cross-reference "${key}"`)
    const text = (options.numbering[key] < 'A') ? `\\chapref{${key}}` : `\\appref{${key}}`
    if (node.children.length === 0) {
      accum.push(text)
    } else {
      childrenToLatex(options, fileInfo, node, accum)
      accum.push(` (${text})`)
    }
  } else {
    console.error('unknown', node.name, fileInfo.filename, node.startIndex, '\n', node)
    process.exit(1)
  }
  return accum
}

/**
 * Convert all children of a node to LaTeX.
 * @param {Object} options Program options.
 * @param {Object} fileInfo Information about this file.
 * @param {Object} node Root node whose children are to be converted.
 * @param {Array} accum Strings generated so far.
 */
const childrenToLatex = (options, fileInfo, node, accum) => {
  node.children.forEach(child => htmlToLatex(options, fileInfo, child, accum))
}

/**
 * Translate a single HTML table to LaTeX.
 * @param {Object} options Program options.
 * @param {Object} fileInfo Information about this file.
 * @param {Object} node Root node of this conversion.
 * @returns {string} Table as LaTeX.
 */
const tableToLatex = (options, fileInfo, node) => {
  assert(node.name === 'table',
    `Calling tableToLatex with wrong node type "${node.name}"`)
  const { headWidth, headRows } = tableHeadToRows(node)
  const { bodyWidth, bodyRows } = tableBodyToRows(node)
  assert((headWidth === 0) || (headWidth === bodyWidth),
    'Table head and body have inconsistent widths')
  const rows = headRows.concat(bodyRows)
  const spec = rows[0].map(x => 'l').join('')
  const body = rows.map(row => {
    const fields = row.map(cell => htmlToLatex(options, fileInfo, cell, []).flat().join(''))
    const joined = fields.join(' & ')
    return `${joined} \\\\\n`
  }).join('')
  return `\n\\begin{tabular}{${spec}}\n${body}\\end{tabular}\n`
}

/**
 * Extract rows from head of table if present.
 * @param {Object} node The table.
 * @returns {Array<Array} Rows.
 */
const tableHeadToRows = (node) => {
  const thead = node.children.filter(child => child.name === 'thead')
  if (thead.length === 0) {
    return { headWidth: 0, headRows: [] }
  }
  assert(thead.length === 1,
    'Table may contain at most one head')
  const headRows = thead[0].children
    .filter(child => child.name === 'tr')
    .map(row => row.children.filter(cell => (cell.name === 'th')))
  const lengths = headRows.map(row => row.length)
  const headWidth = lengths[0]
  assert(lengths.every(len => len === headWidth),
    'Require all table rows to have the same number of cells')
  return { headWidth, headRows }
}

/**
 * Extract rows from body of table.
 * @param {Object} node The table.
 * @returns {Array<Array} Rows.
 */
const tableBodyToRows = (node) => {
  const tbody = node.children.filter(child => child.name === 'tbody')
  assert(tbody.length === 1,
    'Table must contain one tbody')
  const bodyRows = tbody[0].children
    .filter(child => child.name === 'tr')
    .map(row => row.children.filter(cell => (cell.name === 'td')))
  const lengths = bodyRows.map(row => row.length)
  const bodyWidth = lengths[0]
  assert(lengths.every(len => len === bodyWidth),
    'Require all table rows to have the same number of cells')
  return { bodyWidth, bodyRows }
}

/**
 * Translate a single HTML document to text (for use in code blocks).
 * @param {string} html What to translate.
 * @param {function} escape How to escape strings.
 * @returns {string} LaTeX.
 */
const htmlToText = (node, accum, escape) => {
  if (node.type === 'text') {
    accum.push(escape(node.data))
  } else {
    node.children.forEach(child => htmlToText(child, accum, escape))
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
    .replace(/\\/g, '\v')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/\$/g, '\\$')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/#/g, '\\#')
    .replace(/\v/g, '\\textbackslash{}')
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

// Run program.
main()
