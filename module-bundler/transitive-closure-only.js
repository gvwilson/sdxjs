const path = require('path')

const getRequires = require('./get-requires')

const transitiveClosure = (entryPointPath) => {
  const pending = [path.resolve(entryPointPath)]
  const filenames = new Set()
  while (pending.length > 0) {
    const candidate = path.resolve(pending.pop())
    if (filenames.has(candidate)) {
      continue
    }
    filenames.add(candidate)
    const candidateDir = path.dirname(candidate)
    getRequires(candidate)
      .map(raw => path.resolve(path.join(candidateDir, `${raw}.js`)))
      .filter(cooked => !filenames.has(cooked))
      .forEach(cooked => pending.push(cooked))
  }
  return [...filenames]
}

module.exports = transitiveClosure
