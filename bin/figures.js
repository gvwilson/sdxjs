#!/usr/bin/env node

'use strict'

import argparse from 'argparse'
import fs from 'fs'

import {
  addCommonArguments,
  buildOptions,
  createFilePaths
} from './utils.js'

const main = () => {
  const options = getOptions()
  createFilePaths(options)
  let total = { count: 0, fixme: 0 }
  const info = options.chapters
    .map(chapter => {
      const title = chapter.title
      const { count, fixme } = countFigures(chapter.source)
      total.count += count
      total.fixme += fixme
      return { title, count, fixme }
    })
  console.log('Chapter | Figures | Undone')
  console.log('------- | ------- | ------')
  info.forEach(({ title, count, fixme }) => {
    console.log(`${title} | ${count} | ${fixme}`)
  })
  console.log('------- | ------- | ------')
  console.log(`Total | ${total.count} | ${total.fixme}`)
}

/**
 * Build program options.
 * @returns {Object} Program options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  addCommonArguments(parser)
  const fromArgs = parser.parse_args()
  return buildOptions(fromArgs)
}

/**
 * Count the number of figures in a chapter.
 * @param {string} filename File containing inclusions.
 * @returns {number} Count.
 */
const countFigures = (filename) => {
  const text = fs.readFileSync(filename, 'utf-8')
  const matches = text.match(/\/inc\/fig\.html([^]*?)%>/gm)
  if (matches === null) {
    return {count: 0, fixme: 0}
  }
  const count = matches.length
  const fixme = matches.filter(m => m.match(/fixme:\s*true/gm) ? true : false).length
  return {count, fixme}
}

main()
