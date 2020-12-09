import assert from 'assert'
import fs from 'fs'
import path from 'path'
import url from 'url'
import yaml from 'js-yaml'

/**
 * Fill in file paths for all files in a set.
 * @param {string} rootDir Root directory of project.
 * @param {string} htmlDir Where files are going.
 * @param {Array<Object>} allFiles Array of file information objects from YAML.
 * @returns {Array<Object>} Concatenated and decorated file information.
 */
export const createFilePaths = (rootDir, htmlDir, extras, chapters, appendices) => {
  const allFiles = [...extras, ...chapters, ...appendices]
  allFiles.forEach((fileInfo, i) => {
    assert('slug' in fileInfo,
      `Every page must have a slug ${Object.keys(fileInfo)}`)
    fileInfo.index = i
    if (!('source' in fileInfo)) {
      fileInfo.source = path.join(rootDir, fileInfo.slug, 'index.md')
    }
    if ('html' in fileInfo) {
      fileInfo.html = path.join(htmlDir, fileInfo.html)
    } else {
      fileInfo.html = path.join(htmlDir, fileInfo.slug, 'index.html')
    }
  })

  // Mark chapters.
  chapters.forEach(fileInfo => {
    fileInfo.isChapter = true
  })
  extras.forEach(fileInfo => {
    fileInfo.isChapter = false
  })
  appendices.forEach(fileInfo => {
    fileInfo.isChapter = false
  })

  return allFiles
}

/**
 * Extract directory name from file path.
 * @param {string} callerURL Path to work with.
 * @returns {string} Directory name.
 */
export const dirname = (callerURL) => {
  return path.dirname(url.fileURLToPath(callerURL))
}

export const yamlLoad = (filename) => {
  return yaml.safeLoad(fs.readFileSync(filename, 'utf-8'))
}
