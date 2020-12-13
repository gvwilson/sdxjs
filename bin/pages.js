#!/usr/bin/env node

'use strict'

import fs from 'fs'

const main = () => {
  const entries = fs.readFileSync(process.argv[2], 'utf-8')
    .split('\n')
    .map(line => interesting(line))
    .filter(entry => entry !== null)
  console.log('Index | Title | Pages')
  console.log('----- | ----- | -----')
  entries.forEach((entry, i) => {
    if (i === (entries.length - 1)) {
      return
    }
    const pages = entries[i + 1].page - entry.page
    const index = entry.index === null ? '' : entry.index
    console.log(`${index} | ${entry.name} | ${pages}`)
  })
  console.log('----- | ----- | -----')
  const total = entries[entries.length - 1].page
  console.log(` | Total | ${total}`)
}

const interesting = (line) => {
  for (const f of [chapter, bibliography, end]) {
    const match = f(line)
    if (match) {
      return match
    }
  }
  return null
}

const bibliography = (line) => {
  const pat = /\\@writefile{toc}{\\contentsline\s+{fm}{Bibliography}{(.+?)}/
  const match = pat.exec(line)
  return match
    ? { kind: 'bibliography', index: null, name: 'Bibliography', page: parseInt(match[1]) }
    : null
}

const chapter = (line) => {
  const pat = /\\@writefile{toc}{\\contentsline\s+{chapter}{\\numberline\s+{(.+?)}(.+?)}{(.+?)}/
  const match = pat.exec(line)
  if (!match) {
    return null
  }
  const kind = isNaN(match[1]) ? 'appendix' : 'chapter'
  return { kind: kind, index: match[1], name: match[2], page: parseInt(match[3]) }
}

const end = (line) => {
  const pat = /\\gdef\s+\\@abspage@last{(.+?)}/
  const match = pat.exec(line)
  return match
    ? { kind: 'end', index: null, name: null, page: parseInt(match[1]) }
    : null
}

main()
