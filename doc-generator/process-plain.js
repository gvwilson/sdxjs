import fs from 'fs'
import acorn from 'acorn'
import MarkdownIt from 'markdown-it'
import MarkdownAnchor from 'markdown-it-anchor'

import slugify from './slugify.js'

const main = () => {
  const allComments = process.argv.slice(2)
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
  const md = new MarkdownIt({ html: true })
    .use(MarkdownAnchor, { level: 1, slugify: slugify })
  const html = md.render(allComments)
  console.log(html)
}

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

main()
