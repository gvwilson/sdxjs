const fs = require('fs')
const acorn = require('acorn')

const text = fs.readFileSync(process.argv[2])
const options = { locations: true, onComment: [] }
acorn.parse(text, options)
console.log(JSON.stringify(options.onComment, null, 2))
