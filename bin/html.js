#!/usr/bin/env node
'use strict'

/**
 * Turn a single Markdown file into an HTML file.
 */

import argparse from 'argparse'
import assert from 'assert'
import ejs from 'ejs'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'

import {
  EJS_ROOT,
  dirname,
  ensureOutputDir,
  getGlossaryReferences,
  linksToMarkdown,
  loadConfig,
  loadJson,
  loadYaml,
  makeMarkdownTranslator
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
 * Main driver.
 */
const main = () => {
  const options = getOptions()
  options.homeDir = dirname(import.meta.url).replace('/bin', '')
  const site = loadConfig(options.site, options.volume)
  const glossary = buildGlossaryLookup(options.glossary)
  const numbering = loadJson(options.numbering)
  const links = loadYaml(options.links)
  const { pageData, content } = loadFile(options.input)
  const page = mergePageInfo(site, options.input, pageData)
  const result = translate(options, site, glossary, numbering, links, page, content)
  ensureOutputDir(options.output)
  fs.writeFileSync(options.output, result, 'utf-8')
}

/**
 * Build program options.
 * @returns {Object} Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--site')
  parser.add_argument('--volume')
  parser.add_argument('--input')
  parser.add_argument('--output')
  parser.add_argument('--links')
  parser.add_argument('--numbering')
  parser.add_argument('--glossary')
  return parser.parse_args()
}

/**
 * Build {key, value} lookup table for glossary.
 * @param {string} filename File containing YAML glossary.
 * @returns {Object} key-value lookup for glossary terms.
 */
const buildGlossaryLookup = (filename) => {
  const result = {}
  const glossary = loadYaml(filename)
  Object.keys(glossary).forEach(key => {
    result[key] = glossary[key].en.term
  })
  return result
}

/**
 * Load a file to be translated.
 * @param {string} filename File to read.
 * @returns {object + string} Page data plus text with headers.
 */
const loadFile = (filename) => {
  const { data, content } = matter(fs.readFileSync(filename, 'utf-8'))
  return {
    pageData: data,
    content: `${HEADER}\n${content}\n${FOOTER}`
  }
}

/**
 * Merge configuration information about page into information from page file.
 * @param {Object} config Configuration info.
 * @param {string} filename Which file is being processed.
 * @param {Object} page Page data from source file.
 */
const mergePageInfo = (config, filename, page) => {
  const slug = path.dirname(filename, '.md').split('/').pop()
  const all = [...config.chapters, ...config.appendices]
  let result = null
  all.forEach((entry, i) => {
    if (slug === entry.slug) {
      assert(result === null,
        `Duplicate slug ${slug}`)
      result = Object.assign(entry, page)
      result.previous = (i > 0) ? all[i - 1] : null
      result.next = (i < all.length - 1) ? all[i + 1] : null
    }
  })
  assert(result !== null,
   `Unknown slug ${slug}`)
  return result
}

/**
 * Translate and save file.
 * @param {Object} options Program options.
 * @param {Object} site Site data.
 * @param {Array<Object>} glossary Full glossary as YAML.
 * @param {Object} numbering Numbering lookup.
 * @param {string} links Links as YAML.
 * @param {Object} page Page data.
 * @param {string} text Raw text (with headers).
 * @returns {string} Translated text.
 */
const translate = (options, site, glossary, numbering, links, page, text) => {
  // Get keys of glossary entries that are referenced in this page to build a
  // table at the start of the chapter.
  const glossRefs = buildGlossaryTable(glossary, text)

  // Context contains variables required by EJS.
  const context = {
    root: EJS_ROOT,
    filename: options.input
  }

  // Construct a Markdown-to-HTML renderer (since we need to process Markdown
  // inclusions to HTML when rendering tables).
  const mdi = makeMarkdownTranslator()

  // Settings contains local variables for rendering.
  const settings = {
    ...context,
    mdi,
    site,
    page,
    glossRefs,
    links,
    numbering,
    toRoot: '../..',
    toVolume: '..',
    // Since inclusions may contain inclusions, we need to provide the rendering
    // function to the renderer in the settings.
    _render: (something) => ejs.render(something, settings, context),
    _codeClass,
    _exercise,
    _lineCount,
    _numbering,
    _rawFile,
    _readFile,
    _readPage,
    _replace,
    _section,
    _table
  }

  // Translate the page.
  const linksText = linksToMarkdown(links)
  const fullText = `${text}\n\n${linksText}`
  const translated = settings._render(fullText)
  return mdi
    .render(translated)
    .replace(new RegExp(options.homeDir, 'g'), STANDARD_DIR)
}

/**
 * Build a list of key/value pairs for generating the glossary lookup table at the start of a chapter.
 * @param {Array<Object>} glossary Entire glossary.
 * @param {Array<string>} text Page text.
 * @returns {Array<Object>} { key, term } pairs.
 */
const buildGlossaryTable = (glossary, text) => {
  return getGlossaryReferences(text)
    .map(key => {
      return { key, term: glossary[key] }
    })
    .sort((a, b) => a.term.toLowerCase() < b.term.toLowerCase() ? -1 : 1)
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

// Run program.
main()
