#!/usr/bin/env node

import fs from 'fs'
import yaml from 'js-yaml'

const main = () => {
  const config = yaml.safeLoad(fs.readFileSync(process.argv[2], 'utf-8'))
  const info = config.chapters.map(chapter => {
    const title = chapter.title
    const count = ('exercises' in chapter) ? `${chapter.exercises.length}` : '-'
    return { title, count }
  })
  const titleWidth = Math.max(...info.map(entry => entry.title.length))
  const countWidth = Math.max(...info.map(entry => entry.count.length))
  info.forEach(({ title, count }) => {
    console.log(title.padEnd(titleWidth, ' '), count.padStart(countWidth, ' '))
  })
}

main()
