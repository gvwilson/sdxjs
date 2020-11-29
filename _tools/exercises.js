#!/usr/bin/env node

import fs from 'fs'
import yaml from 'js-yaml'

const main = () => {
  const config = yaml.safeLoad(fs.readFileSync(process.argv[2], 'utf-8'))
  let total = 0
  const info = config.chapters.map(chapter => {
    const title = chapter.title
    const count = ('exercises' in chapter) ? `${chapter.exercises.length}` : '-'
    total += (count === '-') ? 0 : parseInt(count)
    return { title, count }
  })
  console.log('Chapter : Exercises')
  console.log('------- : ---------')
  info.forEach(({ title, count }) => {
    console.log(`${title} : ${count}`)
  })
  console.log('------- : ---------')
  console.log(`Total : ${total}`)
}

main()
