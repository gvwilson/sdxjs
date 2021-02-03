#!/usr/bin/env node
'use strict'

/**
 * Translate HTML into LaTeX.
 */

import argparse from 'argparse'
import assert from 'assert'
import fs from 'fs'
import htmlparser2 from 'htmlparser2'

import {
  loadConfig,
  loadJson
} from './utils.js'

/**
 * Nodes to skip entirely.
 */
const SKIP_ENTIRELY = new Set('#comment head footer nav'.split(' '))

/**
 * Nodes to recurse through.
 */
const RECURSE_ONLY = new Set('#document html body main'.split(' '))

/**
 * Scaling factors for PDF images.
 */
const PDF_IMAGE_SCALED = '0.75'
const PDF_IMAGE_UNSCALED = '1.0'

/**
 * Main driver.
 */
const main = () => {
  const options = getOptions()
  const config = loadConfig(options.site, options.volume)
  options.numbering = loadJson(options.numbering)
  addFileInfo(config, options.root)
  const accum = []
  const all = [...config.chapters, ...config.appendices]
  all.forEach(fileInfo => {
    if ('latexBefore' in fileInfo) {
      accum.push(`${fileInfo.latexBefore}\n`)
    }
    const doc = readHtml(fileInfo.filename)
    htmlToLatex(options, fileInfo, doc, new Set(), accum)
  })
  const latex = accum.join('')
  options.head = fs.readFileSync(options.head, 'utf-8')
  options.foot = fs.readFileSync(options.foot, 'utf-8')
  const combined = `${options.head}\n${latex}\n${options.foot}`
  fs.writeFileSync(options.output, combined, 'utf-8')
}

/**
 * Parse command-line arguments.
 * @returns {Object} options Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--site')
  parser.add_argument('--volume')
  parser.add_argument('--foot')
  parser.add_argument('--head')
  parser.add_argument('--numbering')
  parser.add_argument('--output')
  parser.add_argument('--root')
  return parser.parse_args()
}

/**
 * Create input file paths from configuration data.
 * @param {Array<Object>} config Volume configuration information.
 * @param {string} root Path to volume root.
 */
const addFileInfo = (config, root) => {
  const all = [...config.chapters, ...config.appendices]
  all.forEach(entry => {
    entry.filename = `${root}/${entry.slug}/index.html`
  })
}

/**
 * Load required HTML from files.
 * @param {string} filename File to read.
 * @returns {Object} DOM document.
 */
const readHtml = (filename) => {
  const text = fs.readFileSync(filename, 'utf-8').trim()
  const patched = patchHtml(text)
  return htmlparser2.parseDOM(patched)[0]
}

/**
 * Perform ugly patches on the HTML so that the LaTeX will come out right.
 * @param {string} html Input HTML.
 * @returns {string} Patched HTML.
 */
const patchHtml = (html) => {
  // \lede{} must come before \chapter{} so
  // <h1>...</h1> <h2 class="lede">...</h2>
  // =>
  // <h2 class="lede">...</h2> <h1>...</h1>
  if (html.includes('h1')) {
    if (html.includes('<h2 class="lede">')) {
      html = html.replace(/<h1>(.+?)<\/h1>\s+<h2 class="lede">(.+?)<\/h2>/,
        '<h2 class="lede">$2</h2>\n<h1>$1</h1>')
    } else {
      html = html.replace('<h1>', '<h2 class="lede"></h2><h1>')
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
 * @param {Object} fileInfo Information about file.
 * @param {Object} node Root node of this conversion.
 * @param {Set} linksSeen Links seen so far (not to be repeated).
 * @param {Array} accum Strings generated so far.
 * @returns {Array<string>} All strings.
 */
const htmlToLatex = (options, fileInfo, node, linksSeen, accum) => {
  if (node.type === 'text') {
    accum.push(fullEscape(node.data))
  } else if (node.type !== 'tag') {
    assert(false, `unknown node type ${node.type}`)
  } else if (SKIP_ENTIRELY.has(node.name)) {
    // do nothing
  } else if (RECURSE_ONLY.has(node.name)) {
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
  } else if (node.name in HANDLERS) {
    HANDLERS[node.name](options, fileInfo, node, linksSeen, accum)
  } else {
    console.error('unknown', node.name, fileInfo, node.startIndex, '\n', node)
    process.exit(1)
  }
  return accum
}

/**
 * Handlers for node types.
 */
const HANDLERS = {
  a: (options, fileInfo, node, linksSeen, accum) => {
    assert('href' in node.attribs,
           `link without href at ${fileInfo.filename} ${node.startIndex}`)
    accum.push('\\hreffoot{')
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
    accum.push('}{')
    accum.push(fullEscape(node.attribs.href))
    accum.push('}')
  },

  blockquote: (options, fileInfo, node, linksSeen, accum) => {
    accum.push('\\begin{quotation}')
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
    accum.push('\\end{quotation}')
  },

  br: (options, fileInfo, node, linksSeen, accum) => {
    accum.push(' ')
  },

  cite: (options, fileInfo, node, linksSeen, accum) => {
    accum.push('\\cite{')
    node.children.forEach(child => htmlToText(child, accum, fullEscape))
    accum.push('}')
  },

  code: (options, fileInfo, node, linksSeen, accum) => {
    accum.push('\\texttt{')
    node.children.forEach(child => htmlToText(child, accum, fullEscape))
    accum.push('}')
  },

  div: (options, fileInfo, node, linksSeen, accum) => {
    const cls = node.attribs.class
    switch (cls) {
      case 'html-only':
        break

      case 'latex-only':
        node.children.forEach(child => {
          assert(child.type === 'text',
            'latex-only divs may only contain text')
          accum.push(child.data)
        })
        break

      case 'callout':
        accum.push('\\begin{callout}')
        childrenToLatex(options, fileInfo, node, linksSeen, accum)
        accum.push('\\end{callout}')
        break

      case 'centered':
        accum.push('\n{\\centering\n')
        childrenToLatex(options, fileInfo, node, linksSeen, accum)
        accum.push('\n}\n')
        break

      case 'fixme':
        accum.push('\\fixme{')
        childrenToLatex(options, fileInfo, node, linksSeen, accum)
        accum.push('}')
        break

      case 'hint':
        accum.push('\\begin{hint}')
        childrenToLatex(options, fileInfo, node, linksSeen, accum)
        accum.push('\\end{hint}')
        break

      case 'subpage':
        accum.push('\\begin{lstlisting}[caption=FIXME]\n')
        accum.push('FIXME display sub-page')
        accum.push('\\end{lstlisting}')
        break

      case 'continue':
        accum.push('\\begin{unindented}')
        childrenToLatex(options, fileInfo, node, linksSeen, accum)
        accum.push('\\end{unindented}')
        break

      default:
        childrenToLatex(options, fileInfo, node, linksSeen, accum)
        break
    }
  },

  dd: (options, fileInfo, node, linksSeen, accum) => {
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
  },

  dl: (options, fileInfo, node, linksSeen, accum) => {
    const cls = node.attribs.class
    if (cls === 'bibliography') {
      accum.push('\\begin{thebibliography}{ABCD}')
      childrenToLatex(options, fileInfo, node, linksSeen, accum)
      accum.push('\\end{thebibliography}')
    } else {
      accum.push('\\begin{description}')
      childrenToLatex(options, fileInfo, node, linksSeen, accum)
      accum.push('\\end{description}')
    }
  },

  dt: (options, fileInfo, node, linksSeen, accum) => {
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
      childrenToLatex(options, fileInfo, node, linksSeen, accum)
      accum.push('}{')
      accum.push(fullEscape(key))
      accum.push('}')
    } else {
      accum.push('\\item[')
      childrenToLatex(options, fileInfo, node, linksSeen, accum)
      accum.push(']')
    }
  },

  em: (options, fileInfo, node, linksSeen, accum) => {
    accum.push('\\emph{')
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
    accum.push('}')
  },

  f: (options, fileInfo, node, linksSeen, accum) => {
    const key = node.attribs.key
    accum.push(`\\figref{${key}}`)
  },

  figure: (options, fileInfo, node, linksSeen, accum) => {
    accum.push(figureToLatex(options, fileInfo, linksSeen, node))
  },

  g: (options, fileInfo, node, linksSeen, accum) => {
    accum.push('\\glossref{')
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
    accum.push('}{')
    accum.push(fullEscape(node.attribs.key))
    accum.push('}')
  },

  h1: (options, fileInfo, node, linksSeen, accum) => {
    if ('latexSkipChapter' in fileInfo) {
      // do nothing
    } else {
      accum.push('\\chapter{')
      childrenToLatex(options, fileInfo, node, linksSeen, accum)
      accum.push('}\\label{')
      accum.push(fileInfo.slug)
      accum.push('}')
    }
  },

  h2: (options, fileInfo, node, linksSeen, accum) => {
    const cls = node.attribs.class
    if (cls === 'lede') {
      accum.push('\n\\lede{')
      childrenToLatex(options, fileInfo, node, linksSeen, accum)
      accum.push('}')
    } else {
      accum.push('\\section{')
      childrenToLatex(options, fileInfo, node, linksSeen, accum)
      accum.push('}')
    }
  },

  h3: (options, fileInfo, node, linksSeen, accum) => {
    const cls = node.attribs.class
    if (cls === 'callout') {
      accum.push('\\callouttitle{')
      childrenToLatex(options, fileInfo, node, linksSeen, accum)
      accum.push('}')
    } else {
      accum.push('\\subsection*{')
      childrenToLatex(options, fileInfo, node, linksSeen, accum)
      accum.push('}')
    }
  },

  img: (options, fileInfo, node, linksSeen, accum) => {
    const src = node.attribs.src
    accum.push(`\\image{${src}}`)
  },

  key: (options, fileInfo, node, linksSeen, accum) => {
    accum.push('\\keystroke{')
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
    accum.push('}')
  },

  li: (options, fileInfo, node, linksSeen, accum) => {
    accum.push('\\item ')
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
  },

  ol: (options, fileInfo, node, linksSeen, accum) => {
    accum.push('\\begin{enumerate}')
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
    accum.push('\\end{enumerate}')
  },

  p: (options, fileInfo, node, linksSeen, accum) => {
    const cls = node.attribs.class
    if (cls === 'callout') {
      accum.push('\\vspace{\\baselineskip}\n\\noindent')
      childrenToLatex(options, fileInfo, node, linksSeen, accum)
    } else {
      accum.push('\n')
      childrenToLatex(options, fileInfo, node, linksSeen, accum)
    }
  },

  pre: (options, fileInfo, node, linksSeen, accum) => {
    assert((node.children.length === 1) && (node.children[0].name === 'code'),
      'Expect pre to have one code child')
    const title = node.attribs.title ? node.attribs.title : ''
    accum.push(`\\begin{lstlisting}[caption={${title}},captionpos=b,frame=single,frameround=tttt]\n`)
    node.children[0].children.forEach(child => htmlToText(child, accum, nonAsciiEscape))
    accum.push('\\end{lstlisting}')
  },

  strong: (options, fileInfo, node, linksSeen, accum) => {
    accum.push('\\textbf{')
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
    accum.push('}')
  },

  sub: (options, fileInfo, node, linksSeen, accum) => {
    accum.push('\\textsubscript{')
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
    accum.push('}')
  },

  sup: (options, fileInfo, node, linksSeen, accum) => {
    accum.push('\\textsuperscript{')
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
    accum.push('}')
  },

  t: (options, fileInfo, node, linksSeen, accum) => {
    const key = node.attribs.key
    accum.push(`\\tblref{${key}}`)
  },

  table: (options, fileInfo, node, linksSeen, accum) => {
    accum.push(tableToLatex(options, fileInfo, linksSeen, node))
  },

  td: (options, fileInfo, node, linksSeen, accum) => {
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
  },

  th: (options, fileInfo, node, linksSeen, accum) => {
    accum.push('\\tablehead{')
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
    accum.push('}')
  },

  ul: (options, fileInfo, node, linksSeen, accum) => {
    accum.push('\\begin{itemize}')
    childrenToLatex(options, fileInfo, node, linksSeen, accum)
    accum.push('\\end{itemize}')
  },

  x: (options, fileInfo, node, linksSeen, accum) => {
    const key = node.attribs.key
    assert(key,
      'Cross-reference does not contain key attribute')
    assert(key in options.numbering,
      `Unknown cross-reference "${key}"`)
    const text = (options.numbering[key] < 'A') ? `\\chapref{${key}}` : `\\appref{${key}}`
    if (node.children.length === 0) {
      accum.push(text)
    } else {
      childrenToLatex(options, fileInfo, node, linksSeen, accum)
      accum.push(` (${text})`)
    }
  }
}

/**
 * Convert all children of a node to LaTeX.
 * @param {Object} options Program options.
 * @param {Object} fileInfo Information about this file.
 * @param {Object} node Root node whose children are to be converted.
 * @param {Array} accum Strings generated so far.
 */
const childrenToLatex = (options, fileInfo, node, linksSeen, accum) => {
  node.children.forEach(child => htmlToLatex(options, fileInfo, child, linksSeen, accum))
}

/**
 * Translate an HTML figure to LaTeX.
 * @param {Object} options Program options.
 * @param {Object} fileInfo Information about this file.
 * @param {Set} linksSeen Links seen so far.
 * @param {Object} node Root node of this conversion.
 * @returns {string} Figure as LaTeX.
 */
const figureToLatex = (options, fileInfo, linksSeen, node) => {
  assert(node.children.length === 2,
    `Expected 2 children for figure element, not ${node.children.length}`)
  const ident = node.attribs.id
  assert(ident && ident.length > 0,
    'Invalid id attribute for figure')

  const img = node.children[0]
  assert(img.name === 'img',
    `Expected first child of figure to be img, not ${img.name}`)

  const alt = img.attribs.alt
  assert(alt && alt.length > 0,
    'Invalid alt attribute for img in figure')

  const caption = node.children[1]
  assert(caption.name === 'figcaption',
    `Expected first child of figure to be figcaption, not ${img.name}`)

  const accum = []
  childrenToLatex(options, fileInfo, caption, linksSeen, accum)
  const text = accum.join('')

  let cmd = null
  let src = null
  let scale = null
  const cls = node.attribs.class
  if (cls && (cls === 'fixme')) {
    cmd = 'figimg'
    src = `.${options.defaultImage}`
    scale = '1.0'
  } else {
    cmd = 'figpdf'
    src = img.attribs.src
    assert(src && src.length > 0,
      'Invalid src attribute for img in figure')
    src = src
      .replace('./figures', `./${fileInfo.slug}/figures`)
      .replace('.svg', '.pdf')
    scale = (img.attribs.latexscale === 'true') ? PDF_IMAGE_SCALED : PDF_IMAGE_UNSCALED
  }

  const result = `\\${cmd}{${ident}}{${src}}{${text}}{${scale}}`
  return result
}

/**
 * Translate a single HTML table to LaTeX.
 * @param {Object} options Program options.
 * @param {Object} fileInfo Information about this file.
 * @param {Set} linksSeen Links seen so far.
 * @param {Object} node Root node of this conversion.
 * @returns {string} Table as LaTeX.
 */
const tableToLatex = (options, fileInfo, linksSeen, node) => {
  assert(node.name === 'table',
    `Calling tableToLatex with wrong node type "${node.name}"`)

  const { headWidth, headRows } = tableHeadToRows(node)
  const { bodyWidth, bodyRows } = tableBodyToRows(node)
  assert((headWidth === 0) || (headWidth === bodyWidth),
    'Table head and body have inconsistent widths')

  const rows = headRows.concat(bodyRows)
  const spec = rows[0].map(x => 'l').join('')
  const body = rows.map(row => {
    const fields = row.map(cell => htmlToLatex(options, fileInfo, cell, linksSeen, []).flat().join(''))
    const joined = fields.join(' & ')
    return `${joined} \\\\\n`
  }).join('')
  const table = `\\begin{tabular}{${spec}}\n${body}\\end{tabular}`

  // No ID because no need to cross-reference.
  const ident = node.attribs.id
  if (!ident) {
    return `\n${table}\n`
  }

  // Fill in ID and caption.
  assert(ident.length > 0,
    'Invalid id attribute for table')

  const captions = node.children.filter(child => child.name === 'caption')
  assert(captions.length === 1,
    'Table must have exactly one caption')
  const caption = captions[0]
  const accum = []
  childrenToLatex(options, fileInfo, caption, linksSeen, accum)
  const captionText = accum.join('')

  const meta = `\\caption{${captionText}}\n\\label{${ident}}`
  return `\n\\begin{table}\n${table}\n${meta}\n\\end{table}\n`
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
    .replace(/«/g, '{\\guillemotleft}')
    .replace(/»/g, '{\\guillemotright}')
    .replace(/©/g, '{\\textcopyright}')
}

// Run program.
main()
