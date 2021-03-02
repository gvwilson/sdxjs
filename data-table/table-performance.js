import assert from 'assert'
import microtime from 'microtime'
import sizeof from 'object-sizeof'
import yaml from 'js-yaml'

import { buildRows, buildCols } from './build.js'

// [main]
const RANGE = 3

const main = () => {
  const nRows = parseInt(process.argv[2])
  const nCols = parseInt(process.argv[3])
  const filterPerSelect = parseFloat(process.argv[4])

  const labels = [...Array(nCols).keys()].map(i => `label_${i + 1}`)
  const someLabels = labels.slice(0, Math.floor(labels.length / 2))
  assert(someLabels.length > 0,
    'Must have some labels for select (array too short)')

  const [rowTable, rowSize, rowHeap] = memory(buildRows, nRows, labels)
  const [colTable, colSize, colHeap] = memory(buildCols, nRows, labels)

  const rowFilterTime =
    time(rowFilter, rowTable,
      row => ((row.label_1 % RANGE) === 0))
  const rowSelectTime =
    time(rowSelect, rowTable, someLabels)
  const colFilterTime =
    time(colFilter, colTable,
      (table, iR) => ((table.label_1[iR] % RANGE) === 0))
  const colSelectTime =
    time(colSelect, colTable, someLabels)

  const ratio = calculateRatio(filterPerSelect,
    rowFilterTime, rowSelectTime,
    colFilterTime, colSelectTime)

  const result = {
    nRows,
    nCols,
    filterPerSelect,
    rowSize,
    rowHeap,
    colSize,
    colHeap,
    rowFilterTime,
    rowSelectTime,
    colFilterTime,
    colSelectTime,
    ratio
  }
  console.log(yaml.safeDump(result))
}
// [/main]

// [measure]
const memory = (func, ...params) => {
  const before = process.memoryUsage()
  const result = func(...params)
  const after = process.memoryUsage()
  const heap = after.heapUsed - before.heapUsed
  const size = sizeof(result)
  return [result, size, heap]
}

const time = (func, ...params) => {
  const before = microtime.now()
  func(...params)
  const after = microtime.now()
  return after - before
}

const calculateRatio = (f2S, rFilterT, rSelectT, cFilterT, cSelectT) => {
  return ((f2S * rFilterT) + rSelectT) / ((f2S * cFilterT) + cSelectT)
}
// [/measure]

// [operate-rows]
const rowFilter = (table, func) => {
  return table.filter(row => func(row))
}

const rowSelect = (table, toKeep) => {
  return table.map(row => {
    const newRow = {}
    toKeep.forEach(label => {
      newRow[label] = row[label]
    })
    return newRow
  })
}
// [/operate-rows]

// [operate-cols]
const colFilter = (table, func) => {
  const result = {}
  const labels = Object.keys(result)
  labels.forEach(label => {
    result[label] = []
  })
  for (let iR = 0; iR < table.label_1.length; iR += 1) {
    if (func(table, iR)) {
      labels.forEach(label => {
        result[label].push(table[label][iR])
      })
    }
  }
  return result
}

const colSelect = (table, toKeep) => {
  const result = {}
  toKeep.forEach(label => {
    result[label] = table[label]
  })
  return result
}
// [/operate-cols]

main()
