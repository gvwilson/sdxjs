import MarkdownIt from 'markdown-it'
import MarkdownAnchor from 'markdown-it-anchor'

import getComments from './get-comments.js'
import getDefinitions from './get-definitions.js'
import fillIn from './fill-in.js'
import slugify from './slugify.js'

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
  const md = new MarkdownIt({ html: true })
    .use(MarkdownAnchor, { level: 1, slugify: slugify })
  const html = md.render(combined.join('\n\n'))
  console.log(html)
}

main()
