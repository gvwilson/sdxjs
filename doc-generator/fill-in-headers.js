const assert = require('assert')
const marked = require('marked')

const getComments = require('./get-comments.js')
const getDefinitions = require('./get-definitions.js')

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
  const html = marked(combined.join('\n\n'), {gfm: true})
  console.log(html)
}

const fillIn = (filename, comments, definitions) => {
  const map = definitions.reduce((map, def) => {
    map.set(def.start, {name: def.name, type: def.type})
    return map
  }, new Map())

  const filled = comments.map(comment => {
    let text = comment.stripped
    const target = comment.end + 1
    if (map.has(target)) {
      const def = map.get(target)
      const level = def.type === 'MethodDefinition'
            ? '###'
            : '##'
      const title = `${level} ${def.name}\n`
      text = title + text
    }
    return text
  })

  return `# ${filename}\n\n` + filled.join('\n\n')
}

main()
