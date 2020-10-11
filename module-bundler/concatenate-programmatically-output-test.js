const fs = require('fs')
const source = fs.readFileSync('concatenate-programmatically-output.js', 'utf-8')
eval(source)
console.log(everything)
