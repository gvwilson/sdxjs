const assert = require('assert')
const MarkdownIt = require('markdown-it')
const MarkdownAnchor = require('markdown-it-anchor')

const getComments = require('./get-comments.js')
const getDefinitions = require('./get-definitions.js')
const fillIn = require('./fill-in.js')
const slugify = require('./slugify')

const main = () => {
  const filenames = process.argv.slice(2)
  const allComments = getComments(filenames)
  const allDefinitions = getDefinitions(filenames)
  const combined = []
  for (const [filename, comments] of allComments) {
    const definitions = allDefinitions.get(filename)
    const text = fillIn(filename, comments, definitions)
    combined.push(text)
  }
  const md = new MarkdownIt({html: true})
        .use(MarkdownAnchor, {level: 1, slugify: slugify})
  const html = md.render(combined.join('\n\n'))
  console.log(html)
}

main()
