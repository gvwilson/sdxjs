const fs = require('fs')

const loadModule = (filename) => {
  const source = fs.readFileSync(filename, 'utf-8')
  const result = {}
  const fullText = `((module) => {${source}})(result)`
  console.log(`full text for eval:\n${fullText}`)
  eval(fullText)
  return result.exports
}

module.exports = loadModule
