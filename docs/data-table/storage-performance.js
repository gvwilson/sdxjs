import assert from 'assert'
import yaml from 'js-yaml'

import { buildRows, buildCols, timeAndSize } from './build.js'

const main = () => {
  const nRows = parseInt(process.argv[2])
  const nCols = parseInt(process.argv[3])

  const labels = [...Array(nCols).keys()].map(i => `label_${i + 1}`)
  const someLabels = labels.slice(0, Math.floor(labels.length / 2))
  assert(someLabels.length > 0,
    'Must have some labels for select (array too short)')

  const rowTable = buildRows(nRows, labels)
  const colTable = buildCols(nRows, labels)

  const [rowStringTime, rowStringSize] = timeAndSize(asJson, rowTable)
  const [colStringTime, colStringSize] = timeAndSize(asJson, colTable)

  const result = {
    nRows,
    nCols,
    rowStringTime,
    rowStringSize,
    colStringTime,
    colStringSize
  }
  console.log(yaml.safeDump(result))
}

const asJson = (table) => {
  return JSON.stringify(table)
}

main()
