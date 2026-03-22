import fs from 'fs'
import acorn from 'acorn'
import MarkdownIt from 'markdown-it'
import MarkdownAnchor from 'markdown-it-anchor'

import slugify from './slugify.js'

// [main]
const STYLE = 'width: 40rem; padding-left: 0.5rem; border: solid;'
const HEAD = `<html><body style="${STYLE}">`
const FOOT = '</body></html>'

const main = () => {
  const allComments = getAllComments(process.argv.slice(2))
  const md = new MarkdownIt({ html: true })
    .use(MarkdownAnchor, { level: 1, slugify: slugify })
  const html = md.render(allComments)
  console.log(HEAD)
  console.log(html)
  console.log(FOOT)
}
// [/main]

// [getAllComments]
const getAllComments = (allFilenames) => {
  return allFilenames
    .map(filename => {
      const comments = extractComments(filename)
      return { filename, comments }
    })
    .map(({ filename, comments }) => {
      comments = comments.map(comment => removePrefix(comment))
      return { filename, comments }
    })
    .map(({ filename, comments }) => {
      const combined = comments
        .map(comment => comment.stripped)
        .join('\n\n')
      return `# ${filename}\n\n${combined}`
    })
    .join('\n\n')
}
// [/getAllComments]

// [extractComments]
const extractComments = (filename) => {
  const text = fs.readFileSync(filename, 'utf-8')
  const options = {
    sourceType: 'module',
    locations: true,
    onComment: []
  }
  acorn.parse(text, options)
  const subset = options.onComment
    .filter(entry => entry.type === 'Block')
    .map(entry => {
      return {
        type: entry.type,
        value: entry.value,
        start: entry.start,
        end: entry.end
      }
    })
  return subset
}
// [/extractComments]

// [removePrefix]
const removePrefix = (comment) => {
  comment.stripped = comment.value
    .split('\n')
    .slice(0, -1)
    .map(line => line.replace(/^ *\/?\* */, ''))
    .map(line => line.replace('*/', ''))
    .join('\n')
    .trim()
  return comment
}
// [/removePrefix]

main()
