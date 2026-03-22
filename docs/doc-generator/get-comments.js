import fs from 'fs'
import acorn from 'acorn'

const getComments = (filenames) => {
  return filenames.reduce((map, filename) => {
    const comments = extractComments(filename)
      .map(comment => removePrefix(comment))
    map.set(filename, comments)
    return map
  }, new Map())
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
        start: entry.loc.start.line,
        end: entry.loc.end.line
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

export default getComments
