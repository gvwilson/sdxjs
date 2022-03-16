import fs from 'fs'
import path from 'path'

import transitiveClosure from './transitive-closure.js'

const HEAD = `const creators = new Map()
const cache = new Map()

const makeRequire = (absPath) => {
  return (localPath) => {
    const actualKey = translate[absPath][localPath]
    if (!cache.has(actualKey)) {
      const m = {}
      creators.get(actualKey)(m)
      cache.set(actualKey, m.exports)
    }
    return cache.get(actualKey)
  }
}

const initialize = (creators) => {
`

const TAIL = `
}

initialize(creators)
`

const makeProof = (entryPoint) => `
const start = creators.get('${entryPoint}')
const m = {}
start(m)
m.exports()
`

const createBundle = (entryPoint) => {
  entryPoint = path.resolve(entryPoint)
  const table = transitiveClosure(entryPoint)
  const translate = `const translate = ${JSON.stringify(table, null, 2)}`
  const creators = Object.keys(table).map(filename => makeCreator(filename))
  const proof = makeProof(entryPoint)
  return [
    translate,
    HEAD,
    ...creators,
    TAIL,
    proof
  ].join('\n')
}

const makeCreator = (filename) => {
  const key = path.resolve(filename)
  const source = fs.readFileSync(filename, 'utf-8')
  const func = `(module, require = makeRequire('${key}')) =>\n{${source}}`
  const entry = `creators.set('${key}',\n${func})`
  return `// ${key}\n${entry}\n`
}

export default createBundle
