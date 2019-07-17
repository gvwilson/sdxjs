#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const yaml = require('yaml')
const glob = require('glob')

// Markers.
const MARK = {
  glossary_start: '{:auto_ids}',
  glossary_end: '{% include links.md %}'
}

// Command-line driver takes project root directory as its sole argument.
const main = (rootDir) => {
  const config = readConfig(path.join(rootDir, '_config.yml'))
  const topicFiles = readTopicFiles(rootDir)
  const extraFiles = readExtraFiles(config)
  checkTopics(config, topicFiles, extraFiles)
  checkGlossary(config, topicFiles, extraFiles)
}

// Read the YAML configuration file.
const readConfig = (filename) => {
  return yaml.parse(fs.readFileSync(filename, 'utf-8'))
}

// Read all of the topic files ('index.md' in sub-directories).
const readTopicFiles = (rootDir) => {
  return glob.glob.sync(`${rootDir}/*/index.md`)
    .map(path => ({path, content: fs.readFileSync(path, 'utf-8')}))
    .map(({path, content}) => ({path: path.replace(`${rootDir}`, ''), content}))
    .map(({path, content}) => ({path: path.replace('index.md', ''), content}))
}

// Read the extra files enumerated in the configuration file.
const readExtraFiles = (config) => {
  let result = {}
  config.menu.forEach(entry => {
    result[entry.link.replace(/\//g, '')] = fs.readFileSync(entry.path, 'utf-8')
  })
  return result
}

// Check that all topics exist and all existing topics are configured.
const checkTopics = (config, topicFiles, extraFiles) => {
  const expected = new Set(config.topics.map(entry => entry.link))
  const actual = new Set(topicFiles.map(({path, content}) => path))
  report('Topics', expected, actual)
}

// Check that glossary entries are defined and definitions are used.
const checkGlossary = (config, topicFiles, extraFiles) => {
  // Used.
  const used = new Set()
  topicFiles.forEach(({path, content}) => {
    const matches = content.match(/\/glossary\/#[^)]+/g)
    if (matches) {
      matches.forEach(item => used.add(item.replace('/glossary/#', '')))
    }
  })

  // Defined.
  const start = extraFiles.glossary.indexOf(MARK.glossary_start) +
        MARK.glossary_start.length
  const end = extraFiles.glossary.indexOf(MARK.glossary_end)
  const glossary = extraFiles.glossary.substring(start, end)
  const defined = new Set()
  glossary.match(/^\w.+$/gm).forEach(
    m => defined.add(slugify(m.replace(':', '')))
  )

  // Report.
  report('Glossary', used, defined)
}

const slugify = (text) => {
  return text.toLowerCase().replace(/[ ()]+/g, '-').replace(/-$/, '')
}

const report = (title, left, right) => {
  const missing = [...left].filter(item => !right.has(item))
  if (missing.length) {
    console.log(`${title}: missing`)
    missing.sort().forEach(item => console.log(`- ${item}`))
  }

  const unused = [...right].filter(item => !left.has(item))
  if (unused.length) {
    console.log(`${title}: unused`)
    unused.sort().forEach(item => console.log(`- ${item}`))
  }
}

// Run the main driver.
main(process.argv[2])
