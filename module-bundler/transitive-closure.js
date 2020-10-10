const path = require('path')

const getRequires = require('./extract-require')

const transitiveClosure = (entryPointPath) => {
  const mapping = {}
  const pending = [path.resolve(entryPointPath)]
  const seen = new Set()
  while (pending.length > 0) {
    const candidate = path.resolve(pending.pop())
    if (seen.has(candidate)) {
      continue
    }
    seen.add(candidate)
    mapping[candidate] = {}
    const candidateDir = path.dirname(candidate)
    getRequires(candidate)
      .map(raw => {
        mapping[candidate][raw] = 
          path.resolve(path.join(candidateDir, `${raw}.js`))
        return mapping[candidate][raw]
      })
      .filter(cooked => cooked !== null)
      .forEach(cooked => pending.push(cooked))
  }
  return {filenames: [...seen], mapping}
}

if (require.main === module) {
  const result = transitiveClosure(process.argv[2])
  console.log(JSON.stringify(result, null, 2))
}
else {
  module.exports = transitiveClosure
}
