import assert from 'assert'
import yaml from 'js-yaml'

import { buildRows, timeAndSize } from './build.js'

const main = () => {
  const nRows = parseInt(process.argv[2])
  const nCols = parseInt(process.argv[3])

  const labels = [...Array(nCols).keys()].map(i => `label_${i + 1}`)
  const someLabels = labels.slice(0, Math.floor(labels.length / 2))
  assert(someLabels.length > 0,
    'Must have some labels for select (array too short)')

  const rowTable = buildRows(nRows, labels)
  const [packedRowStringTime, packedRowStringSize] = timeAndSize(asPackedJson, rowTable)
  const result = {
    nRows,
    nCols,
    packedRowStringTime,
    packedRowStringSize
  }
  console.log(yaml.safeDump(result))
}

// [packed]
const asPackedJson = (table) => {
  const temp = {}
  temp.keys = Object.keys(table[0])
  temp.values = table.map(row => temp.keys.map(k => row[k]))
  return JSON.stringify(temp)
}
// [/packed]

main()
