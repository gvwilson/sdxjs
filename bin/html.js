#!/usr/bin/env node

'use strict'

import argparse from 'argparse'
import assert from 'assert'
import ejs from 'ejs'
import glob from 'glob'
import fs from 'fs'
import MarkdownIt from 'markdown-it'
import MarkdownAnchor from 'markdown-it-anchor'
import MarkdownContainer from 'markdown-it-container'
import matter from 'gray-matter'
import path from 'path'
import rimraf from 'rimraf'

import {
  addCommonArguments,
  buildLinks,
  buildOptions,
  createFilePaths,
  dirname,
  getGlossaryReferences,
  yamlLoad
} from './utils.js'

/**
 * Standard directory to show instead of user's directory.
 */
const STANDARD_DIR = '/u/stjs'

/**
 * Header inclusion.
 */
const HEADER = "<%- include('/inc/page-head.html') %>"

/**
 * Footer inclusion.
 */
const FOOTER = "<%- include('/inc/page-foot.html') %>"

/**
 * Width of tables showing terms defined at the start of a chapter.
 */
const ITEM_TABLE_WIDTH = 3

/**
 * Main driver.
 */
const main = () => {
  const options = getOptions()
  const glossary = buildGlossary(options)
  buildLinks(options)
  const allFiles = buildFileInfo(options)
  const numbering = buildNumbering(options)
  loadFiles(allFiles)
  rimraf.sync(options.html)
  allFiles.forEach(
    fileInfo => translate(options, fileInfo, glossary, numbering)
  )
  finalize(options)
}

/**
 * Build program options.
 * @returns {Object} Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  addCommonArguments(parser, '--gloss', '--links')
  parser.add_argument('--replaceDir', { action: 'store_true' })
  const fromArgs = parser.parse_args()
  fromArgs.homeDir = dirname(import.meta.url).replace('/bin', '')
  return buildOptions(fromArgs)
}

/**
 * Build a glossary for filling in words used.
 * @param {Object} options Options.
 * @returns {Object} Glossary keys mapped to strings.
 */
const buildGlossary = (options) => {
  const text = fs.readFileSync(options.gloss, 'utf-8')
  const pat = /<dt\s+id="(.+?)"\s+class="glossary">(.+?)<\/dt>/g
  const matches = [...text.matchAll(pat)]
  const result = {}
  matches.forEach(m => {
    result[m[1]] = m[2]
  })
  return result
}

/**
 * Extract files from options and decorate information records.
 * @param {Object} options Options.
 * @returns {Array<Object>} File information.
 */
const buildFileInfo = (options) => {
  const allFiles = createFilePaths(options)
  const pages = [...options.chapters, ...options.appendices]
  pages.forEach((fileInfo, i) => {
    fileInfo.previous = (i > 0) ? pages[i - 1] : null
    fileInfo.next = (i < pages.length - 1) ? pages[i + 1] : null
  })
  return allFiles
}

/**
 * Load all files to be translated (so that cross-references can be built).
 * @param {Object} allFiles All files records.
 */
const loadFiles = (allFiles) => {
  allFiles.forEach((fileInfo, i) => {
    const { data, content } = matter(fs.readFileSync(fileInfo.source, 'utf-8'))
    Object.assign(fileInfo, data)
    fileInfo.content = `${HEADER}\n${content}\n${FOOTER}`
  })
}

/**
 * Translate and save each file.
 * @param {Object} options Program options.
 * @param {Object} fileInfo Information about file.
 * @param {Object} glossary Keys and terms.
 * @param {Object} numbering Map slugs to numbers/letters.
 */
const translate = (options, fileInfo, glossary, numbering) => {
  // Context contains variables required by EJS.
  const context = {
    root: options.root,
    filename: fileInfo.source
  }

  // Get the glossary entries that are referenced in this page.
  const glossRefs = getGlossaryReferences(fileInfo.content)

  // Construct a Markdown-to-HTML renderer (since we need to process Markdown
  // inclusions to HTML when rendering tables).
  const mdi = new MarkdownIt({ html: true })
    .use(MarkdownAnchor, { level: 1, slugify: slugify })
    .use(MarkdownContainer, 'callout')
    .use(MarkdownContainer, 'centered')
    .use(MarkdownContainer, 'continue')
    .use(MarkdownContainer, 'fixme')
    .use(MarkdownContainer, 'hint')

  // Settings contains "local" variables for rendering.
  const settings = {
    ...context,
    site: options,
    page: fileInfo,
    toRoot: toRoot(options.html, fileInfo.html),
    glossary,
    glossRefs,
    mdi,
    numbering,
    // Since inclusions may contain inclusions, we need to provide the rendering
    // function to the renderer in the settings.
    _render: (text) => ejs.render(text, settings, context),
    _codeClass,
    _exercise,
    _lineCount,
    _numbering,
    _rawFile,
    _readFile,
    _readPage,
    _replace,
    _section,
    _table,
    _termsDefined
  }

  // Translate the page.
  const translated = settings._render(`${fileInfo.content}\n\n${options.linksText}`)
  let html = mdi.render(translated)
  if (options.replaceDir) {
    html = html.replace(new RegExp(options.homeDir, 'g'), STANDARD_DIR)
  }

  // Save result.
  ensureOutputDir(fileInfo.html)
  fs.writeFileSync(fileInfo.html, html, 'utf-8')
}

/**
 * Create class attribute of code inclusion.
 * @param {string} filename Name of file.
 * @returns {string} Class attribute.
 */
const _codeClass = (filename) => {
  return `language-${path.extname(filename).slice(1)}`
}

/**
 * Read exercise problem or solution for inclusion.
 * @param {function} render How to translate loaded file.
 * @param {string} root Path to root.
 * @param {Object} chapter Chapter information.
 * @param {Object} exercise Exercise information.
 * @param {string} which Either 'problem' or 'solution'
 */
const _exercise = (render, root, chapter, exercise, which) => {
  const title = `<h3 class="exercise">${exercise.title}</h3>`
  const contents = render(fs.readFileSync(exercise[which], 'utf-8'))
  return `${title}\n\n${contents}\n`
}

/**
 * Count lines.
 * @param {string} mainFile Name of file doing the inclusion.
 * @param {string} subFile Name of file being included.
 * @returns {string} Number of lines as string.
 */
const _lineCount = (mainFile, subFile) => {
  const num = fs.readFileSync(`${path.dirname(mainFile)}/${subFile}`, 'utf-8')
    .split('\n')
    .length
  return `${num}`
}

/**
 * Include numbering.
 * @param {Object} numbering Map slugs to numbers/letters.
 */
const _numbering = (numbering) => {
  return `const NUMBERING = ${JSON.stringify(numbering)}`
}

/**
 * Include a file as-is.
 * @param {string} mainFile Name of file doing the inclusion.
 * @param {string} subFile Name of file being included.
 * @returns {string} File contents as-is.
 */
const _rawFile = (mainFile, subFile) => {
  return fs.readFileSync(`${path.dirname(mainFile)}/${subFile}`, 'utf-8')
}

/**
 * Read file for code inclusion.
 * @param {string} mainFile Name of file doing the inclusion.
 * @param {string} subFile Name of file being included.
 * @param {Array<function>} filters Filters to apply to text before escaping.
 * @returns {string} File contents (possibly with minimal HTML escaping).
 */
const _readFile = (mainFile, subFile, filters = []) => {
  let raw = _rawFile(mainFile, subFile)
  if (path.extname(subFile) === '.js') {
    raw = raw
      .replace(/\s*\/\/\s*eslint-disable-line.*$/gm, '')
      .replace(/\s*\/\*\s*eslint-disable\s+.*\*\/\s*$/gm, '')
  }
  filters.forEach(filter => {
    raw = filter(mainFile, subFile, raw)
  })
  return raw
    .replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
}

/**
 * Read HTML page for inclusion.
 * @param {string} mainFile Name of file doing the inclusion.
 * @param {string} subFile Name of file being included.
 * @returns {string} Contents of body.
 */
const _readPage = (mainFile, subFile) => {
  const content = _rawFile(mainFile, subFile)
  return content
}

/**
 * Replace text in a pattern (checking that the marker is present).
 * @param {string} original Source string.
 * @param {string} marker What to replace (must be present).
 * @param {string} replacement What to replace with.
 * @returns Substituted string.
 */
const _replace = (original, marker, replacement) => {
  assert(original.includes(marker),
    `String "${original}" does not include marker "${marker}" for replacement`)
  return original.replace(marker, replacement)
}

/**
 * Read a file and keep or discard sections (keep first, then discard from that).
 * @param {string} mainFile Name of file doing the inclusion.
 * @param {string} subFile Name of file being included.
 * @param {string} options Controls for filtering.
 * @returns {string} File contents (possibly with minimal HTML escaping).
 */
const _section = (mainFile, subFile, options) => {
  const filters = []

  if ('keep' in options) {
    const extract = (mainFile, subFile, raw) => {
      const key = options.keep
      const pattern = new RegExp(`//\\s*<${key}>\\s*\n(.+?)\\s*//\\s*</${key}>`, 's')
      const match = raw.match(pattern)
      assert(match,
        `Failed to find key ${key} in ${mainFile}/${subFile}`)
      return match[1]
    }
    filters.push(extract)
  }

  if ('erase' in options) {
    const extract = (mainFile, subFile, raw) => {
      const key = options.erase
      const pattern = new RegExp(`^\\s*//\\s*<${key}>.+//\\s*</${key}>\\s*$`, 'ms')
      return raw.replace(pattern, '...')
    }
    filters.push(extract)
  }

  return _readFile(mainFile, subFile, filters)
}

/**
 * Load an external Markdown table and create a beautiful HTML table.
 * @param {string} mainFile Name of file doing the inclusion.
 * @param {Object} mdi Markdown-to-HTML renderer.
 * @param {string} id Table ID.
 * @param {string} tableFile File containing Markdown table.
 * @param {string} cap Table caption
 * @returns {string} HTML table.
 */
const _table = (mainFile, mdi, id, tableFile, cap) => {
  const markdown = _readFile(mainFile, tableFile)
  const html = mdi.render(markdown)
  const header = `<table id="${id}"><caption>${cap}</caption>`
  return html.replace('<table>', header)
}

/**
 * Turn a list of defined terms into a table for the start of a chapter.
 * @param {Array<string>} items Items to put in the table.
 * @returns {string} HTML table.
 */
const _termsDefined = (items) => {
  while ((items.length % ITEM_TABLE_WIDTH) !== 0) {
    items.push('&nbsp;')
  }
  const rows = []
  for (let i = 0; i < items.length; i += ITEM_TABLE_WIDTH) {
    const columns = items.slice(i, i + ITEM_TABLE_WIDTH).map(item => `<td>${item}</td>`)
    rows.push(`<tr>${columns.join('')}</td>`)
  }
  return `<table><tbody>${rows.join('\n')}</tbody></table>`
}

/**
 * Turn title text into anchor.
 * @param {string} text Input text
 * @returns {string} slug
 */
const slugify = (text) => {
  return encodeURIComponent(text.trim()
    .toLowerCase()
    .replace(/[^ \w]/g, '')
    .replace(/\s+/g, '-'))
}

/**
 * Copy static files.
 * @param {Object} options Options.
 */
const finalize = (options) => {
  // Copy source files.
  const sourceFiles = [...options.chapters, ...options.appendices]
    .map(entry => entry.slug)
    .map(slug => options.sourceFiles.map(pattern => `${slug}/**/${pattern}`))
    .flat()
    .map(pattern => path.join(options.root, pattern))
    .map(pattern => glob.sync(pattern))
    .flat()
  copyFiles(options, sourceFiles)

  // Save numbering for LaTeX.
  const numbering = buildNumbering(options)
  fs.writeFileSync(path.join(options.html, 'numbering.js'),
    JSON.stringify(numbering, null, 2), 'utf-8')
}

/**
 * Copy a set of files, making directories as needed.
 * @param {Object} options Options.
 * @param {Array<string>} filenames What to copy.
 */
const copyFiles = (options, filenames) => {
  filenames.forEach(source => {
    const dest = makeOutputPath(options.html, source)
    ensureOutputDir(dest)
    fs.copyFileSync(source, dest)
  })
}

/**
 * Build numbering lookup table for chapters and appendices.
 * @param {Object} options Options.
 * @returns {Object} slug-to-number-or-letter lookup table.
 */
const buildNumbering = (options) => {
  const result = {}
  const numbered = [...options.extras, ...options.chapters]
  numbered.forEach((fileInfo, i) => {
    result[fileInfo.slug] = `${i + 1}`
  })
  const start = 'A'.charCodeAt(0)
  options.appendices.forEach((fileInfo, i) => {
    result[fileInfo.slug] = String.fromCharCode(start + i)
  })
  return result
}

/**
 * Construct output filename.
 * @param {string} output Output directory.
 * @param {string} source Source file path.
 * @param {Object} suffixes Lookup table for suffix substitution.
 * @returns {string} Output file path.
 */
const makeOutputPath = (output, source, suffixes = {}) => {
  let dest = path.join(output, source)
  const ext = path.extname(dest)
  if (ext in suffixes) {
    dest = dest.slice(0, dest.lastIndexOf(ext)) + suffixes[ext]
  }
  return dest
}

/**
 * Ensure output directory exists.
 * @param {string} outputPath File path.
 */
const ensureOutputDir = (outputPath) => {
  const dirName = path.dirname(outputPath)
  fs.mkdirSync(dirName, { recursive: true })
}

/**
 * Calculate the relative root path.
 * @param {string} rootDir Path to root directory.
 * @param {string} filePath Path to file.
 * @returns {string} Path from file to root directory.
 */
const toRoot = (rootDir, filePath) => {
  const path = filePath
    .replace(rootDir, '')
    .split('/')
    .filter(field => field !== '')
    .slice(1)
    .map(field => '..')
    .join('/')
  return (path === '') ? '.' : path
}

// Run program.
main()
