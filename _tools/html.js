#!/usr/bin/env node

'use strict'

const argparse = require('argparse')
const assert = require('assert')
const ejs = require('ejs')
const glob = require('glob')
const fs = require('fs')
const MarkdownIt = require('markdown-it')
const MarkdownAnchor = require('markdown-it-anchor')
const MarkdownContainer = require('markdown-it-container')
const matter = require('gray-matter')
const minimatch = require('minimatch')
const path = require('path')
const rimraf = require('rimraf')
const yaml = require('js-yaml')

/**
 * Default settings.
 */
const DEFAULTS = {
  configFile: 'config.yml',
  linksFile: 'links.yml',
  outputDir: 'docs',
  rootDir: '.'
}

/**
 * Standard directory to show instead of user's directory.
 */
const STANDARD_DIR = '/u/stjs'

/**
 * Header inclusion.
 */
const HEADER = "<%- include('/_inc/head.html') %>"

/**
 * Footer inclusion.
 */
const FOOTER = "<%- include('/_inc/foot.html') %>"

/**
 * Main driver.
 */
const main = () => {
  const options = getOptions()
  const linksText = buildLinks(options)
  const allFiles = buildFileInfo(options)
  loadFiles(allFiles)
  rimraf.sync(options.outputDir)
  allFiles.forEach(fileInfo => translateFile(options, fileInfo, linksText))
  finalize(options)
}

/**
 * Build program options.
 * @returns {Object} Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--configFile', { default: DEFAULTS.configFile })
  parser.add_argument('--linksFile', { default: DEFAULTS.linksFile })
  parser.add_argument('--outputDir', { default: DEFAULTS.outputDir })
  parser.add_argument('--rootDir', { default: DEFAULTS.rootDir })
  parser.add_argument('--replaceDir', { action: 'store_true' })

  const fromArgs = parser.parse_args()
  fromArgs.homeDir = __dirname.replace('/_tools', '')
  const fromFile = yaml.safeLoad(fs.readFileSync(fromArgs.configFile, 'utf-8'))
  const options = { ...fromArgs, ...fromFile }

  assert(options.linksFile,
    'Need a links file')
  assert(options.outputDir,
    'Need a site directory')
  assert(options.rootDir,
    'Need a root directory')

  return options
}

/**
 * Build table of Markdown links to append to pages during translation.
 * @param {Object} options Options.
 * @returns {string} Table of links to append to all Markdown files.
 */
const buildLinks = (options) => {
  options.links = yaml.safeLoad(fs.readFileSync(options.linksFile, 'utf-8'))
  return options.links
    .map(entry => `[${entry.slug}]: ${entry.url}`)
    .join('\n')
}

/**
 * Extract files from options and decorate information records.
 * @param {Object} options Options.
 * @returns {Array<Object>} File information.
 */
const buildFileInfo = (options) => {
  // All files.
  const allFiles = [...options.extras, ...options.chapters, ...options.appendices]
  allFiles.forEach((fileInfo, i) => {
    assert('slug' in fileInfo,
      `Every page must have a slug ${Object.keys(fileInfo)}`)
    fileInfo.index = i
    if (!('source' in fileInfo)) {
      fileInfo.source = path.join(options.rootDir, fileInfo.slug, 'index.md')
    }
    if (!('output' in fileInfo)) {
      fileInfo.output = path.join(fileInfo.slug, 'index.html')
    }
  })

  // Numbered pages.
  const numbered = [...options.chapters, ...options.appendices]
  numbered.forEach((fileInfo, i) => {
    fileInfo.previous = (i > 0) ? numbered[i - 1] : null
    fileInfo.next = (i < numbered.length - 1) ? numbered[i + 1] : null
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
 * @param {string} linksText Markdown-formatted links table.
 */
const translateFile = (options, fileInfo, linksText) => {
  // Context contains variables required by EJS.
  const context = {
    root: options.rootDir,
    filename: fileInfo.source
  }

  // Settings contains "local" variables for rendering.
  const settings = {
    ...context,
    site: options,
    page: fileInfo,
    toRoot: toRoot(fileInfo.output),
    _codeClass,
    _exercise,
    _readErase,
    _readFile,
    _readPage,
    _readSlice
  }

  // Since inclusions may contain inclusions, we need to provide the rendering
  // function to the renderer in the settings.
  settings._render = (text) => ejs.render(text, settings, context)

  // Translate the page.
  const translated = settings._render(`${fileInfo.content}\n\n${linksText}`)
  const mdi = new MarkdownIt({ html: true })
    .use(MarkdownAnchor, { level: 1, slugify: slugify })
    .use(MarkdownContainer, 'callout')
  let html = mdi.render(translated)
  if (options.replaceDir) {
    html = html.replace(new RegExp(options.homeDir, 'g'), STANDARD_DIR)
  }

  // Save result.
  const outputPath = path.join(options.outputDir, fileInfo.output)
  ensureOutputDir(outputPath)
  fs.writeFileSync(outputPath, html, 'utf-8')
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
  const path = `${root}/${chapter.slug}/${exercise.slug}/${which}.md`
  const contents = render(fs.readFileSync(path, 'utf-8'))
  return `${title}\n\n${contents}\n`
}

/**
 * Read file for code inclusion.
 * @param {string} mainFile Name of file doing the inclusion.
 * @param {string} subFile Name of file being included.
 * @param {function} extract What to extract (if null, keep everything).
 * @returns {string} File contents (possibly with minimal HTML escaping).
 */
const _readFile = (mainFile, subFile, extract = null) => {
  let raw = fs.readFileSync(`${path.dirname(mainFile)}/${subFile}`, 'utf-8')
  if (path.extname(subFile) === '.js') {
    raw = raw
      .replace(/\s*\/\/\s*eslint-disable-line.*$/gm, '')
      .replace(/\s*\/\*\s*eslint-disable\s+.*\*\/\s*$/gm, '')
  }
  if (extract) {
    raw = extract(mainFile, subFile, raw)
  }
  return raw
    .replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
}

/**
 * Read file for code inclusion and keep a slice.
 * @param {string} mainFile Name of file doing the inclusion.
 * @param {string} subFile Name of file being included.
 * @param {string} tag Identifier for slice to keep.
 * @returns {string} File contents (possibly with minimal HTML escaping).
 */
const _readSlice = (mainFile, subFile, tag) => {
  const extract = (mainFile, subFile, raw) => {
    const pattern = new RegExp(`//\\s*<${tag}>\\s*\n(.+?)\\s*//\\s*</${tag}>`, 's')
    const match = raw.match(pattern)
    assert(match,
      `Failed to find tag ${tag} in ${mainFile}/${subFile}`)
    return match[1]
  }
  return _readFile(mainFile, subFile, extract)
}

/**
 * Read file for code inclusion and delete a slice.
 * @param {string} mainFile Name of file doing the inclusion.
 * @param {string} subFile Name of file being included.
 * @param {string} tag Identifier for slice to erase.
 * @returns {string} File contents (possibly with minimal HTML escaping).
 */
const _readErase = (mainFile, subFile, tag) => {
  const extract = (mainFile, subFile, raw) => {
    const pattern = new RegExp(`^\\s*//\\s*<${tag}>.+//\\s*</${tag}>\\s*$`, 'ms')
    return raw.replace(pattern, '...')
  }
  return _readFile(mainFile, subFile, extract)
}

/**
 * Read HTML page for inclusion.
 * @param {string} mainFile Name of file doing the inclusion.
 * @param {string} subFile Name of file being included.
 * @returns {string} Contents of body.
 */
const _readPage = (mainFile, subFile) => {
  const content = fs.readFileSync(`${path.dirname(mainFile)}/${subFile}`, 'utf-8')
  // FIXME: extract body
  return content
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
 * Copy static files and save numbering data.
 * @param {Object} options Options.
 */
const finalize = (options) => {
  // Miscellaneous files.
  const excludes = options.exclude.map(pattern => new minimatch.Minimatch(pattern))
  const miscFiles = options.copy
    .map(pattern => path.join(options.rootDir, pattern))
    .map(pattern => glob.sync(pattern))
    .flat()
    .filter(filename => !excludes.some(pattern => pattern.match(filename)))
  copyFiles(options, miscFiles)

  // Source files.
  const sourceFiles = [...options.chapters, ...options.appendices]
    .map(entry => entry.slug)
    .map(slug => options.sourceFiles.map(pattern => `${slug}/**/${pattern}`))
    .flat()
    .map(pattern => path.join(options.rootDir, pattern))
    .map(pattern => glob.sync(pattern))
    .flat()
  copyFiles(options, sourceFiles)

  // Numbering.
  const numbering = buildNumbering(options)
  fs.writeFileSync(path.join(options.outputDir, 'numbering.js'),
    JSON.stringify(numbering, null, 2),
    'utf-8')
}

/**
 * Copy a set of files, making directories as needed.
 * @param {Object} options Options.
 * @param {Array<string>} filenames What to copy.
 */
const copyFiles = (options, filenames) => {
  filenames.forEach(source => {
    const dest = makeOutputPath(options.outputDir, source)
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
 * @param {string} filePath Path to file.
 * @returns {string} Path from file to root directory.
 */
const toRoot = (filePath) => {
  const dirPath = path.dirname(filePath)
  return (dirPath === '.') ? '.' : dirPath.split('/').map(x => '..').join('/')
}

// Run program.
main()
