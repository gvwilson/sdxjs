const fs = require('fs')

const TOP = 'everything = {'

const TEMPLATE = `'FILENAME': ((module) => {
BODY
return module
})({})`

const BOTTOM = '}'

const createEverything = (filenames) => {
  const sections = filenames.map(filename => {
    const body = fs.readFileSync(filename, 'utf-8')
    return TEMPLATE
      .replace('FILENAME', filename)
      .replace('BODY', body)
  })
  return `${TOP}\n${sections.join('\n')}\n${BOTTOM}`
}

const main = () => {
  const result = createEverything(process.argv.slice(2))
  console.log(result)
}

main()
