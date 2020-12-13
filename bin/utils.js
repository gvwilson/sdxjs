'use strict'

import assert from 'assert'
import fs from 'fs'
import path from 'path'
import url from 'url'
import yaml from 'js-yaml'

/**
 * Add common options to argument parser.
 * @param {Object} parser Argument parser.
 * Other parameters are extra options.
 */
export const addCommonArguments = (parser, ...extras) => {
  const args = ['--config', '--common', '--html', '--root']
  args.forEach(arg => parser.add_argument(arg))
  extras.forEach(arg => parser.add_argument(arg))
}

/**
 * Build full options from command-line arguments and configuration files.
 * @param {Object} fromArgs Parsed arguments.
 */
export const buildOptions = (fromArgs) => {
  const common = yamlLoad(fromArgs.common)
  const config = yamlLoad(fromArgs.config)
  return { ...common, ...config, ...fromArgs }
}

/**
 * Fill in file paths for all files in a set.
 * @param {Object} options Object with .root, .html, .extras, .chapters, and .appendices.
 * @returns {Array<Object>} Concatenated and decorated file information.
 */
export const createFilePaths = (options) => {
  const allEntries = getAllEntries(options)
  allEntries.forEach((fileInfo, i) => {
    assert('slug' in fileInfo,
      `Every page must have a slug ${Object.keys(fileInfo)}`)
    fileInfo.index = i

    // Markdown source file
    if (!('source' in fileInfo)) {
      fileInfo.source = path.join(options.root, fileInfo.slug, 'index.md')
    }

    // Problems and solutions (if any)
    if ('exercises' in fileInfo) {
      fileInfo.exercises.map(ex => {
        ex.problem = path.join(options.root, fileInfo.slug, ex.slug, 'problem.md')
        ex.solution = path.join(options.root, fileInfo.slug, ex.slug, 'solution.md')
      })
    }

    // Output HTML
    if ('html' in fileInfo) {
      fileInfo.html = path.join(options.html, fileInfo.html)
    } else {
      fileInfo.html = path.join(options.html, fileInfo.slug, 'index.html')
    }
  })

  // Mark entries as chapters or not.
  options.chapters.forEach(fileInfo => {
    fileInfo.isChapter = true
  })
  options.extras.forEach(fileInfo => {
    fileInfo.isChapter = false
  })
  options.appendices.forEach(fileInfo => {
    fileInfo.isChapter = false
  })

  return allEntries
}

/**
 * Extract directory name from file path.
 * @param {string} callerURL Path to work with.
 * @returns {string} Directory name.
 */
export const dirname = (callerURL) => {
  return path.dirname(url.fileURLToPath(callerURL))
}

/**
 * Get all entries from options.
 * @param {Object} options Options with .extras, .chapters, and .appendices.
 * @returns {Array<Object>} Linearized chapters
 */
export const getAllEntries = (options) => {
  return [
    ...options.extras,
    ...options.chapters,
    ...options.appendices
  ]
}

/**
 * Get all Markdown source files.
 * @param {Object} options Options with .extras, .chapters, and .appendices.
 * @returns {Array<string>} All Markdown file paths.
 */
export const getAllSources = (options) => {
  const result = []
  getAllEntries(options).forEach(entry => {
    result.push(entry.source)
    if ('exercises' in entry) {
      entry.exercises.forEach(ex => {
        result.push(ex.problem)
        result.push(ex.solution)
      })
    }
  })
  return result
}

/**
 * Load a YAML file.
 * @param {string} filename File to load.
 * @returns {Object} YAML.
 */
export const yamlLoad = (filename) => {
  return yaml.safeLoad(fs.readFileSync(filename, 'utf-8'))
}

/**
 * Save a YAML file.
 * @param {string} filename File to write.
 * @param {Object} data YAML.
 */
export const yamlSave = (filename, data) => {
  fs.writeFileSync(filename, yaml.safeDump(data), 'utf-8')
}
