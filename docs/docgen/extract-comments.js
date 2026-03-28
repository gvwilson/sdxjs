import fs from 'fs'
import acorn from 'acorn'

const text = fs.readFileSync(process.argv[2], 'utf-8')
const options = {
  sourceType: 'module',
  locations: true,
  onComment: []
}
acorn.parse(text, options)
console.log(JSON.stringify(options.onComment, null, 2))
