import fs from 'fs'
import path from 'path'

const HEAD = `const initialize = (creators) => {
`

const TAIL = `
}
`

const combineFiles = (allFilenames) => {
  const body = allFilenames
    .map(filename => {
      const key = path.resolve(filename)
      const source = fs.readFileSync(filename, 'utf-8')
      const func = `(module, require) => {${source}}`
      const entry = `creators.set('${key}',\n${func})`
      return `// ${key}\n${entry}\n`
    })
    .join('\n')
  const func = `${HEAD}\n${body}\n${TAIL}`
  return func
}

export default combineFiles
