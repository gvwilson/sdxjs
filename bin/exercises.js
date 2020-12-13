#!/usr/bin/env node

'use strict'

import { yamlLoad } from './utils.js'

const main = () => {
  const config = yamlLoad(process.argv[2])
  let total = 0
  let chaptersWith = 0
  let chaptersWithout = 0
  const info = config.chapters
    .filter(chapter => {
      return (!('exercises' in chapter)) || Array.isArray(chapter.exercises)
    })
    .map(chapter => {
      const title = chapter.title
      const count = ('exercises' in chapter) ? `${chapter.exercises.length}` : '-'
      total += (count === '-') ? 0 : parseInt(count)
      chaptersWith += (count === '-') ? 0 : 1
      chaptersWithout += (count === '-') ? 1 : 0
      return { title, count }
    })
  console.log('Chapter | Exercises')
  console.log('------- | ---------')
  info.forEach(({ title, count }) => {
    console.log(`${title} | ${count}`)
  })
  console.log('------- | ---------')
  console.log(`Total | ${total}`)
  console.log(`With | ${chaptersWith}`)
  console.log(`Without | ${chaptersWithout}`)
}

main()
