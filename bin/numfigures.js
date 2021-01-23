#!/usr/bin/env node

'use strict'

import argparse from 'argparse'
import fs from 'fs'
import glob from 'glob'

import {
  addCommonArguments,
  buildOptions,
  createFilePaths
} from './utils.js'

const HEAD = '<html><body style="background-color: #f0e0d0">'
const FOOT = '</body></html>'

const main = () => {
  const options = getOptions()
  createFilePaths(options)
  report(options)
  display(options)
}

/**
 * Build program options.
 * @returns {Object} Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  addCommonArguments(parser, '--figures')
  const fromArgs = parser.parse_args()
  return buildOptions(fromArgs)
}

/**
 * Report number of figures
 * @param {Object} options Program options.
 */
const report = (options) => {
  const total = { count: 0, fixme: 0 }
  const info = options.chapters
    .map(chapter => {
      const title = chapter.title
      const { count, fixme } = countFigures(chapter.source)
      total.count += count
      total.fixme += fixme
      return { title, count, fixme }
    })
  console.log('Chapter | Figures | Done | Undone')
  console.log('------- | ------- | ---- | ------')
  info.forEach(({ title, count, fixme }) => {
    console.log(`${title} | ${count} | ${count - fixme} | ${fixme}`)
  })
  console.log('------- | ------- | ---- | ------')
  console.log(`Total | ${total.count} | ${total.count - total.fixme} | ${total.fixme}`)
}

/**
 * Count the number of figures in a chapter.
 * @param {string} filename File containing inclusions.
 * @returns {number} Count.
 */
const countFigures = (filename) => {
  const text = fs.readFileSync(filename, 'utf-8')
  const matches = text.match(/\/inc\/figure\.html([^]*?)%>/gm)
  if (matches === null) {
    return { count: 0, fixme: 0 }
  }
  const count = matches.length
  const fixme = matches.filter(m => m.match(/fixme:\s*true/gm)).length
  return { count, fixme }
}

/**
 * Build a web page showing all figures.
 * @param {string} filename File containing inclusions.
 */
const display = (options) => {
  const filenames = options.chapters.map(chapter => {
    return glob.sync(`${chapter.slug}/figures/*.svg`)
  }).flat()
  const images = filenames.map(f => `<p>${f}</p><p><img src="./${f}" /></p>`).join('\n')
  const page = `${HEAD}\n${images}\n${FOOT}`
  fs.writeFileSync(options.figures, page, 'utf-8')
}

main()
