#!/usr/bin/env node

'use strict'

import argparse from 'argparse'
import assert from 'assert'
import ejs from 'ejs'
import glob from 'glob'
import fs from 'fs'
import MarkdownIt from 'markdown-it'
import MarkdownAnchor from 'markdown-it-anchor'
import matter from 'gray-matter'
import minimatch from 'minimatch'
import path from 'path'
import rimraf from 'rimraf'
import yaml from 'js-yaml'

import {makeBib} from './bib.js'
import {makeGloss} from './gloss.js'

/**
 * Default settings.
 */
const DEFAULTS = {
  configFile: '_config.yml',
  linksFile: '_links.yml',
  outputDir: '_site',
  bibInputFile: '_bib.yml',
  bibOutputFile: 'bib.md',
  glossInputFile: '_gloss.yml',
  glossOutputFile: 'gloss.md',
  rootDir: '.'
}

/**
 * File containing Markdown-formatted links.
 */
const LINKS_FILE = 'links.md'

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
  const config = getConfiguration()
  const linksText = buildLinks(config)
  createBibFile(config)
  createGlossFile(config)
  const allFiles = buildFileInfo(config)
  loadFiles(allFiles)
  rimraf.sync(config.outputDir)
  allFiles.forEach(fileInfo => translateFile(config, fileInfo, linksText))
  copyFiles(config)
  noJekyll(config)
}

/**
 * Build program configuration.
 * @returns {Object} Program configuration.
 */
const getConfiguration = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--bibInput', {default: DEFAULTS.bibInputFile})
  parser.add_argument('--bibOutput', {default: DEFAULTS.bibOutputFile})
  parser.add_argument('--glossInput', {default: DEFAULTS.glossInputFile})
  parser.add_argument('--glossOutput', {default: DEFAULTS.glossOutputFile})
  parser.add_argument('-c', '--configFile', {default: DEFAULTS.configFile})
  parser.add_argument('-l', '--linksFile', {default: DEFAULTS.linksFile})
  parser.add_argument('-o', '--outputDir', {default: DEFAULTS.outputDir})
  parser.add_argument('-r', '--rootDir', {default: DEFAULTS.rootDir})
  const fromArgs = parser.parse_args()

  const fromFile = yaml.safeLoad(fs.readFileSync(fromArgs.configFile))
  const config = {...fromArgs, ...fromFile}

  assert(config.linksFile,
         `Need a links file`)
  assert(config.outputDir,
         `Need a site directory`)
  assert(config.rootDir,
         `Need a root directory`)

  return config
}

/**
 * Build table of Markdown links to append to pages during translation.
 * @param {Object} config Configuration.
 * @returns {string} Table of links to append to all Markdown files.
 */
const buildLinks = (config) => {
  config.links = yaml.safeLoad(fs.readFileSync(config.linksFile))
  return config.links
    .map(entry => `[${entry.slug}]: ${entry.url}`)
    .join('\n')
}

/**
 * Extract files from configuration and decorate information records.
 * @param {Object} config Configuration.
 * @returns {Array<Object>} File information.
 */
const buildFileInfo = (config) => {
  // All files.
  const allFiles = [...config.extras, ...config.chapters, ...config.appendices]
  allFiles.forEach((fileInfo, i) => {
    assert('slug' in fileInfo,
           `Every page must have a slug ${Object.keys(fileInfo)}`)
    fileInfo.index = i
    if (!('source' in fileInfo)) {
      fileInfo.source = path.join(config.rootDir, fileInfo.slug, 'index.md')
    }
    if (!('output' in fileInfo)) {
      fileInfo.output = path.join(fileInfo.slug, 'index.html')
    }
  })

  // Numbered pages.
  const numbered = [...config.chapters, ...config.appendices]
  numbered.forEach((fileInfo, i) => {
    fileInfo.previous = (i > 0) ? numbered[i-1] : null
    fileInfo.next = (i < numbered.length-1) ? numbered[i+1] : null
  })

  return allFiles
}

/**
 * Load all files to be translated (so that cross-references can be built).
 * @param {Object} allFiles All files records.
 */
const loadFiles = (allFiles) => {
  allFiles.forEach((fileInfo, i) => {
    const {data, content} = matter(fs.readFileSync(fileInfo.source))
    Object.assign(fileInfo, data)
    fileInfo.content = `${HEADER}\n${content}\n${FOOTER}`
  })
}

/**
 * Make bibliography file for translation if requested.
 * @param {Object} config Program configuration.
 */
const createBibFile = (config) => {
  if (!('bibInput' in config) && !('bibOutput' in config)) {
    return
  }
  assert(('bibInput' in config) && ('bibOutput' in config),
         `Require both bibliography input and output files`)
  const data = yaml.safeLoad(fs.readFileSync(config.bibInput))
  const text = makeBib(data)
  fs.writeFileSync(config.bibOutput, text)
}

/**
 * Make glossary file for translation if requested.
 * @param {Object} config Program configuration.
 */
const createGlossFile = (config) => {
  if (!('glossInput' in config) && !('glossOutput' in config)) {
    return
  }
  assert(('glossInput' in config) && ('glossOutput' in config),
         `Require both glossary input and output files`)
  const data = yaml.safeLoad(fs.readFileSync(config.glossInput))
  const text = makeGloss(data)
  fs.writeFileSync(config.glossOutput, text)
}

/**
 * Translate and save each file.
 * @param {Object} config Program configuration.
 * @param {Object} fileInfo Information about file.
 * @param {string} linksText Markdown-formatted links table.
 */
const translateFile = (config, fileInfo, linksText) => {
  const context = {
    root: config.rootDir,
    filename: fileInfo.source
  }
  const settings = {
    ...context,
    path: path,
    fs: fs,
    site: config,
    page: fileInfo,
    relativeRoot: relativeRoot(fileInfo.output)
  }
  const previous = settings.page.previous ? settings.page.previous.title : '-nope-'
  const next = settings.page.next ? settings.page.next.title : '-nope-'
  const fullContent = `${fileInfo.content}\n\n${linksText}`
  const expanded = ejs.render(fullContent, settings, context)
  const mdi = new MarkdownIt({html: true})
        .use(MarkdownAnchor, {level: 2})
  const html = mdi.render(expanded)
  const outputPath = path.join(config.outputDir, fileInfo.output)
  ensureOutputDir(outputPath)
  fs.writeFileSync(outputPath, html)
}

/**
 * Copy files verbatim.
 * @param {Object} config Configuration.
 */
const copyFiles = (config) => {
  const excludes = config.exclude.map(pattern => new minimatch.Minimatch(pattern))
  const toCopy = config.copy
        .map(pattern => path.join(config.rootDir, pattern))
        .map(pattern => glob.sync(pattern))
        .flat()
        .filter(filename => !excludes.some(pattern => pattern.match(filename)))
  toCopy.forEach(source => {
    const dest = makeOutputPath(config.outputDir, source)
    ensureOutputDir(dest)
    fs.copyFileSync(source, dest)
  })
}

/**
 * Signal that the site is not built with Jekyll (for GitHub Pages).
 * @param {Object} config Configuration.
 */
const noJekyll = (config) => {
  const filePath = path.join(config.outputDir, '.nojekyll')
  fs.writeFileSync(filePath, 'no Jekyll')
}

/**
 * Construct output filename.
 * @param {string} output Output directory.
 * @param {string} source Source file path.
 * @param {Object} suffixes Lookup table for suffix substitution.
 * @returns {string} Output file path.
 */
const makeOutputPath = (output, source, suffixes={}) => {
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
  fs.mkdirSync(dirName, {recursive: true})
}

/**
 * Calculate the relative root path.
 * @param {string} filePath Path to file.
 * @returns {string} Path from file to root directory.
 */
const relativeRoot = (filePath) => {
  const dirPath = path.dirname(filePath)
  return (dirPath === '.') ? '.' : dirPath.split('/').map(x => '..').join('/')
}

// Run program.
main()
