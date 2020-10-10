const path = require('path')

const getRequires = require('./extract-require')

const transitiveClosure = (entryPointPath) => {
  const pending = [path.resolve(entryPointPath)]
  const seen = new Set()
  while (pending.length > 0) {
    const candidate = path.resolve(pending.pop())
    if (seen.has(candidate)) {
      continue
    }
    seen.add(candidate)
    const candidateDir = path.dirname(candidate)
    getRequires(candidate)
      .map(raw => path.resolve(path.join(candidateDir, `${raw}.js`)))
      .filter(cooked => !seen.has(cooked))
      .forEach(cooked => pending.push(cooked))
  }
  return [...seen]
}

if (module.loaded) {
  module.exports = transitiveClosure
}
else {
  const result = transitiveClosure(process.argv[2])
  console.log(JSON.stringify(result, null, 2))
}
