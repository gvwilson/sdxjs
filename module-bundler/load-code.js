const fs = require('fs')

const loadCode = (allFilenames) => {
  return allFilenames.reduce((soFar, filename) => {
    soFar[filename] = fs.readFileSync(filename, 'utf-8')
    return soFar
  }, {})
}

module.exports = loadCode
