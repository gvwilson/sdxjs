const fs = require('fs')

const safeLoad = (module, filename) => {
  const source = fs.readFileSync(process.argv[2], 'utf-8')
  eval(source)
}

const main = () => {
  console.log('caller before', module.id, module.exports)
  const childModule = {}
  safeLoad(childModule, process.argv[2])
  console.log('caller after', module.id, module.exports)
  console.log('childModule after', childModule)
}

main()
