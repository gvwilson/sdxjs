const fs = require('fs')

const loadModule = (filename, need) => {
  const source = fs.readFileSync(filename, 'utf-8')
  const result = {}
  const fullText = `((module, need) => {${source}})(result, need)`
  console.log(`full text for eval:\n${fullText}`)
  eval(fullText)
  return result.exports
}

module.exports = loadModule
