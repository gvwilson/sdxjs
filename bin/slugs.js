#!/usr/bin/env node

import assert from 'assert'

import {
  createFilePaths,
  yamlLoad
} from './utils.js'

const main = () => {
  const [which, root, html, commonFile, configFile] = process.argv.slice(2)
  const options = {
    ...yamlLoad(commonFile),
    ...yamlLoad(configFile),
    ...{ root, html }
  }
  const allFiles = createFilePaths(options)
  let result = null
  switch (which) {
    case 'chapters':
      result = allFiles.filter(e => e.isChapter).map(e => e.slug).join(' ')
      break

    case 'exercises':
      result = []
      allFiles.forEach(entry => {
        if ('exercises' in entry) {
          entry.exercises.forEach(ex => {
            result.push(ex.problem)
            result.push(ex.solution)
          })
        }
      })
      result = result.join(' ')
      break

    case 'html':
      result = allFiles.map(e => e.html).join(' ')
      break

    case 'source':
      result = allFiles.map(e => e.source).join(' ')
      break

    default:
      assert(false, `Unknown control ${which}`)
  }

  console.log(result)
}

main()
