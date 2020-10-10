const fs = require('fs')

const transitiveClosure = require('./transitive-closure')
const loadCode = require('./load-code')

const bundle = (entryPointPath) => {
  const {filenames, mapping} = transitiveClosure(entryPointPath)
  const source = loadCode(filenames)
  for (let filename in source) {
    source[filename] = decorate(filename, source[filename])
  }
  const mappingText = `const MAPPING = ${JSON.stringify(mapping, null, 2)}`
  const sourceText = `const SOURCE = ${JSON.stringify(source, null, 2)}`
  const allModuleKeys = filenames.map(filename => `"${filename}": undefined`)
  const exportsText = `const EXPORTS = {\n  ${allModuleKeys.join('\n  ')}\n}`
  return [
    mappingText,
    sourceText,
    exportsText
  ].join('\n\n')
}

const decorate = (filename, contents) => {
  const requireDef = `const require = (raw) => EXPORTS[MAPPING[filename][raw]]`
  const module = {}
  eval(`${requireDef}\n${contents}`)
  return module.exports
}

const main = () => {
  const result = bundle(process.argv[2])
  console.log(result)
}

main()
