#!/usr/bin/env node

'use strict'

const argparse = require('argparse')
const fs = require('fs')
const glob = require('glob')
const parse5 = require('parse5')
const path = require('path')
const yaml = require('js-yaml')

/**
 * Suffices of interesting included files.
 */
const SUFFIX = new Set(['.html', '.js', '.sh', '.text'])

/**
 * Maximum width of lines in code inclusions.
 */
const WIDTH = 70

/**
 * Main driver.
 */
const main = () => {
  const options = getOptions()

  checkExercises(options)

  const markdown = loadMarkdown(options)
  checkInclusions(markdown)
  checkLineEndings(markdown)

  const html = loadHtml(options)
  checkGloss(html)
  checkTabs(html)
  checkWidths(html)
}

/**
 * Parse command-line arguments.
 * @returns {Object} options Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--config')
  parser.add_argument('--html', {nargs: '+'})
  parser.add_argument('--markdown', {nargs: '+'})
  return parser.parse_args()
}

/**
 * Load Markdown.
 * @param {Object} options Program options.
 * @returns {Array<Object>} Filenames and text.
 */
const loadMarkdown = (options) => {
  return options.markdown.map(filename => {
    const text = fs.readFileSync(filename, 'utf-8').trim()
    return {filename, text}
  })
}

/**
 * Load HTML.
 * @param {Object} options Program options.
 * @returns {Array<Object>} Filenames, text, and DOM.
 */
const loadHtml = (options) => {
  return options.html.map(filename => {
    const text = fs.readFileSync(filename, 'utf-8').trim()
    const doc = parse5.parse(text, {sourceCodeLocationInfo: true})
    return {filename, text, doc}
  })
}

/**
 * Check for mis-matches in exercise directories.
 * @param {Object} options Program options.
 */
const checkExercises = (options) => {
  const config = yaml.safeLoad(fs.readFileSync(options.config, 'utf-8'))
  const expected = new Set()
  const actual = new Set()
  config.chapters
    .forEach(chapter => {
      if ('exercises' in chapter) {
        chapter.exercises.map(exercise => `${chapter.slug}/${exercise.slug}`)
          .forEach(full => expected.add(full))
      }
      glob.sync(`${chapter.slug}/*/problem.md`)
        .map(problem => problem
             .replace('/problem.md', ''))
        .forEach(full => actual.add(full))
    })
  showSetDiff('Missing exercises', expected, actual)
  showSetDiff('Unused exercises', actual, expected)

  const problems = new Set()
  const solutions = new Set()
  config.chapters
    .forEach(chapter => {
      glob.sync(`${chapter.slug}/*/problem.md`)
        .map(problem => problem.replace('/problem.md', ''))
        .forEach(stem => problems.add(stem))
      glob.sync(`${chapter.slug}/*/solution.md`)
        .map(solution => solution.replace('/solution.md', ''))
        .forEach(stem => solutions.add(stem))
    })
  showSetDiff('Problems without solutions', problems, solutions)
  showSetDiff('Solutions without problems', solutions, problems)
}

/**
 * Check glossary references and entries.
 * @param {Array<Object>} files File information.
 */
const checkGloss = (files) => {
  const used = new Set(files.map(({text}) => {
    const matches = [...text.matchAll(/<g\s+key="(.+?)">/g)]
    return matches.map(match => match[1])
  }).flat())
  const defined = new Set(files.map(({text}) => {
    const matches = [...text.matchAll(/<dt\s+id="(.+?)"\s+class="glossary">/g)]
    return matches.map(match => match[1])
  }).flat())
  showSetDiff('Glossary used but not defined', used, defined)
  showSetDiff('Glossary defined but not used', defined, used)
}

/**
 * Check file inclusions.
 * @param {Array<Object>} files File information.
 */
const checkInclusions = (files) => {
  const existing = new Set()
  const included = new Set()
  files.forEach(({filename, text}) => {
    glob.sync(`${path.dirname(filename)}/*.*`)
      .filter(f => SUFFIX.has(path.extname(f)))
      .forEach(f => existing.add(f))
    getIncluded(filename, text).forEach(filename => included.add(filename))
  })
  showSetDiff('In directories but not included', existing, included)
}

/**
 * Check for Windows line endings in source files.
 * @param {Array<Object>} files File information.
 */
const checkLineEndings = (files) => {
  const windows = files.filter(({text}) => text.includes('\r'))
  if (windows.length > 0) {
    const filenames = windows.map(({filename}) => filename).join('\n- ')
    console.log(`file(s) contain Windows line endings\n- ${filenames}`)
  }
}

/**
 * Check for tabs in source files.
 * @param {Array<Object>} files File information.
 */
const checkTabs = (files) => {
  files.forEach(({filename, text}) => {
    for (const c of text) {
      if (c === '\t') {
	console.log(`${filename} contains tabs`)
	return
      }
    }
  })
}

/**
 * Check widths of code inclusions.
 * @param {Array<Object>} files File information.
 */
const checkWidths = (files) => {
  const counts = files.reduce((accum, {filename, text}) => {
    const matches = [...text.matchAll(/<pre\s+title="(.+?)"><code.+?>([^]+?)<\/code><\/pre>/g)]
    const num = matches.reduce((accum, [match, title, body]) => {
      const lines = body.split('\n').filter(line => line.trimEnd().length > WIDTH)
      return accum + lines.length
    }, 0)
    accum[filename] = num
    return accum
  }, {})
  const oversize = Object.keys(counts).filter(filename => counts[filename] > 0).sort()
  if (oversize.length > 0) {
    const result = oversize.map(filename => `${filename}: ${counts[filename]}`).join('\n- ')
    console.log(`Over-length code lines:\n- ${result}`)
  }
}

/**
 * Get all the files included in a Markdown file.
 * @param {string} filename Which file.
 * @param {string} text Body of file.
 * @returns {Set} Set of included files.
 */
const getIncluded = (filename, text) => {
  const result = new Set()
  const base = path.dirname(filename)
  const matches = [...text.matchAll(/<%-\s+include\('\/inc\/(.+?).html',\s*{(.+?)}\s*\)\s*%>/g)]
  matches.forEach(match => {
    if ((match[1] === 'code') || (match[1] === 'html')){
      const f = match[2].match(/file:\s*'(.+?)'/)[1]
      const full = path.join(base, f)
      result.add(full)
    }
    else if (match[1] === 'multi') {
      const pair = match[2].match(/pat:\s*'(.+?)',\s*fill:\s*'(.+?)'/)
      const pat = pair[1]
      pair[2].split(' ').forEach(fill => {
        const full = path.join(base, pat.replace('*', fill))
        result.add(full)
      })
    }
  })
  return result
}

/**
 * Show differences (if any) between two sets.
 * @param {string} title Title string.
 * @param {Set} left One set.
 * @param {Set} right Other set.
 */
const showSetDiff = (title, left, right) => {
  const diff = Array.from(left).filter(item => !right.has(item)).sort()
  if (diff.length > 0) {
    console.log(`${title}\n- ${diff.join('\n- ')}`)
  }
}

// Run program.
main()
