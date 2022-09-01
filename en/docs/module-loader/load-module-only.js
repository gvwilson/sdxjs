import fs from 'fs'

const loadModule = (filename) => {
  const source = fs.readFileSync(filename, 'utf-8')
  const result = {}
  const fullText = `((module) => {${source}})(result)`
  console.log(`full text for eval:\n${fullText}\n`)
  eval(fullText)
  return result.exports
}

export default loadModule
