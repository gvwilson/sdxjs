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
  let total = 0
  const info = options.chapters
    .map(chapter => {
      const title = chapter.title
      const count = countFigures(chapter.source)
      total += count
      return { title, count }
    })
  console.log('Chapter | Figures')
  console.log('------- | -------')
  info.forEach(({ title, count }) => {
    console.log(`${title} | ${count}`)
  })
  console.log('------- | -------')
  console.log(`Total | ${total}`)
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
  const matches = text.match(/\/inc\/fig.html/g)
  return matches ? matches.length : 0
}

main()
