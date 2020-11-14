const assert = require('assert')
const microtime = require('microtime')
const sizeof = require('object-sizeof')
const yaml = require('js-yaml')

const { buildRows, buildCols } = require('./build')

const main = () => {
  const nRows = parseInt(process.argv[2])
  const nCols = parseInt(process.argv[3])

  const labels = [...Array(nCols).keys()].map(i => `c${i + 1}`)
  const someLabels = labels.slice(0, Math.floor(labels.length / 2))
  assert(someLabels.length > 0,
    'Must have some labels for select (array too short)')

  const rowTable = buildRows(nRows, labels)
  const colTable = buildCols(nRows, labels)

  const [rowStringTime, rowStringSize] = timeAndSize(asJson, rowTable)
  const [colStringTime, colStringSize] = timeAndSize(asJson, colTable)
  const [packedRowStringTime, packedRowStringSize] = timeAndSize(asPackedJson, rowTable)

  const result = {
    nRows,
    nCols,
    rowStringTime,
    rowStringSize,
    colStringTime,
    colStringSize,
    packedRowStringTime,
    packedRowStringSize
  }
  console.log(yaml.safeDump(result))
}

const timeAndSize = (func, ...params) => {
  const before = microtime.now()
  const result = func(...params)
  const after = microtime.now()
  return [after - before, sizeof(result)]
}

const asJson = (table) => {
  return JSON.stringify(table)
}

// <packed>
const asPackedJson = (table) => {
  const temp = {}
  temp.keys = Object.keys(table[0])
  temp.values = table.map(row => temp.keys.map(k => row[k]))
  return JSON.stringify(temp)
}
// </packed>

main()
