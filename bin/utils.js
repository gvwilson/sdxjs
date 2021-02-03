'use strict'

import fs from 'fs'
import path from 'path'
import url from 'url'
import yaml from 'js-yaml'
import MarkdownIt from 'markdown-it'
import MarkdownAnchor from 'markdown-it-anchor'
import MarkdownContainer from 'markdown-it-container'

/**
 * Root directory for EJS lookups.
 */
export const EJS_ROOT = '.'

/**
 * Maximum width of lines in code inclusions.
 */
export const WIDTH = 72

/**
 * Extract directory name from file path.
 * @param {string} callerURL Path to work with.
 * @returns {string} Directory name.
 */
export const dirname = (callerURL) => {
  return path.dirname(url.fileURLToPath(callerURL))
}

/**
 * Ensure output directory exists.
 * @param {string} outputPath File path.
 */
export const ensureOutputDir = (outputPath) => {
  const dirName = path.dirname(outputPath)
  fs.mkdirSync(dirName, { recursive: true })
}

/**
 * Get all glossary references from a file.
 * @param {string} text Text of file.
 * @returns {Array<string>} Keys of all glossary references.
 */
export const getGlossaryReferences = (text) => {
  const pat = /<g\s+key="(.+?)">/g
  const matches = [...text.matchAll(pat)]
  return matches.map(m => m[1])
}

/**
 * Convert links YAML to Markdown.
 * @param {Array<Object>} links Links as YAML.
 * @returns {string} Links as Markdown.
 */
export const linksToMarkdown = (links) => {
  return links
    .map(entry => `[${entry.slug}]: ${entry.url}`)
    .join('\n')
}

/**
 * Load multiple configuration files.
 * @param {Array<string>} filenames Files to load.
 * @result {Object} Merged configuration files.
 */
export const loadConfig = (...filenames) => {
  let result = {}
  filenames.forEach(filename => {
    result = { ...result, ...loadYaml(filename) }
  })
  result.chapters.forEach(entry => {
    entry.isChapter = true
    if ('exercises' in entry) {
      entry.exercises.forEach(ex => {
        ex.problem = path.join(entry.slug, ex.slug, 'problem.md')
        ex.solution = path.join(entry.slug, ex.slug, 'solution.md')
      })
    }
  })
  result.appendices.forEach(entry => {
    entry.isChapter = false
  })
  return result
}

/**
 * Load a JSON file.
 * @param {Array<string>} filename File to read.
 * @returns {Object} contents.
 */
export const loadJson = (filename) => {
  return JSON.parse(fs.readFileSync(filename, 'utf-8'))
}

/**
 * Load a YAML file.
 * @param {string} filename File to load.
 * @returns {Object} YAML.
 */
export const loadYaml = (filename) => {
  return yaml.safeLoad(fs.readFileSync(filename, 'utf-8'))
}

/**
 * Construct Markdown-to-HTML translator.
 */
export const makeMarkdownTranslator = () => {
  const slugify = (text) => {
    return encodeURIComponent(text.trim()
      .toLowerCase()
      .replace(/[^ \w]/g, '')
      .replace(/\s+/g, '-'))
  }
  return new MarkdownIt({ html: true })
    .use(MarkdownAnchor, { level: 1, slugify: slugify })
    .use(MarkdownContainer, 'callout')
    .use(MarkdownContainer, 'centered')
    .use(MarkdownContainer, 'continue')
    .use(MarkdownContainer, 'fixme')
    .use(MarkdownContainer, 'hint')
}

/**
 * Save a YAML file.
 * @param {string} filename File to write.
 * @param {Object} data YAML.
 */
export const saveYaml = (filename, data) => {
  fs.writeFileSync(filename, yaml.safeDump(data), 'utf-8')
}
