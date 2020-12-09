#!/usr/bin/env node

import {
  createFilePaths,
  yamlLoad
} from './utils.js'

const main = () => {
  const [which, rootDir, htmlDir, commonFile, configFile] = process.argv.slice(2)
  const config = { ...yamlLoad(commonFile), ...yamlLoad(configFile) }
  const allFiles = createFilePaths(
    rootDir,
    htmlDir,
    config.extras,
    config.chapters,
    config.appendices
  )
  let result = null
  if (which === 'chapters') {
    result = allFiles.filter(e => e.isChapter).map(e => e.slug).join(' ')
  } else if (which === 'html') {
    result = allFiles.map(e => e.html).join(' ')
  } else if (which === 'source') {
    result = allFiles.map(e => e.source).join(' ')
  }
  console.log(result)
}

main()
