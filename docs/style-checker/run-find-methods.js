import FindMethods from './find-methods.js'

const main = () => {
  const dirname = process.argv[2]
  const filename = process.argv[3]
  const className = process.argv[4]
  const finder = new FindMethods()
  const details = finder.find(dirname, filename, className).reverse()
  const methods = getAllMethodNames(details)
  const table = tabulate(details, methods)
  console.log(tableToMarkdown(table))
}

const getAllMethodNames = (records) => {
  const names = new Set()
  records.forEach(record =>
    record.methods.forEach(name => names.add(name)))
  return [...names].sort()
}

const tabulate = (details, methods) => {
  const result = [
    ['method', ...details.map(entry => entry.className)]
  ]
  methods.forEach(methodName => {
    const row = [methodName]
    details.forEach(({ methods }) => {
      methods.indexOf(methodName) === -1
        ? row.push('.')
        : row.push('X')
    })
    result.push(row)
  })
  return result
}

const tableToMarkdown = (table) => {
  const width = table[0].length
  table.splice(1, 0, Array(width).fill('----'))
  return table
    .map(row => '| ' + row.join(' | ') + ' |')
    .join('\n')
}

main()
