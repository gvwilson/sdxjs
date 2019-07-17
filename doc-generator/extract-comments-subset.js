const fs = require('fs')
const acorn = require('acorn')

const text = fs.readFileSync(process.argv[2])
const options = {locations: true, onComment: []}
const ast = acorn.parse(text, options)
const subset = options.onComment.map(entry => {
  return {
    type: entry.type,
    value: entry.value,
    start: entry.loc.start.line,
    end: entry.loc.end.line
  }
})
console.log(JSON.stringify(subset, null, 2))
