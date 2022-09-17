import path from 'path'
import getRequires from './get-requires.js'

const transitiveClosure = (entryPointPath) => {
  const mapping = {}
  const pending = [path.resolve(entryPointPath)]
  const filenames = new Set()
  while (pending.length > 0) {
    const candidate = path.resolve(pending.pop())
    if (filenames.has(candidate)) {
      continue
    }
    filenames.add(candidate)
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
  return mapping
}

export default transitiveClosure
