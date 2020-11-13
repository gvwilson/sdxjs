const assert = require('assert')
const microtime = require('microtime')
const sizeof = require('object-sizeof')
const yaml = require('js-yaml')

const RANGE = 3

const main = () => {
  const nRows = parseInt(process.argv[2])
  const nCols = parseInt(process.argv[3])
  const filterPerSelect = parseFloat(process.argv[4])

  const labels = [...Array(nCols).keys()].map(i => `c${i+1}`)
  const someLabels = labels.slice(0, Math.floor(labels.length / 2))
  assert(someLabels.length > 0,
    'Must have some labels for select (array too short)')

  const [rowTable, rowSize, rowHeap] = memory(buildRows, nRows, labels)
  const [colTable, colSize, colHeap] = memory(buildCols, nRows, labels)

  const rowFilterTime = time(rowFilter, rowTable, row => (row.c1 === 0))
  const rowSelectTime = time(rowSelect, rowTable, someLabels)
  const colFilterTime = time(colFilter, colTable, (table, iR) => (table.c1[iR] === 0))
  const colSelectTime = time(colSelect, colTable, someLabels)

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

const buildRows = (nRows, labels) => {
  const result = []
  for (let iR = 0; iR < nRows; iR += 1) {
    const row = {}
    labels.forEach(label => {
      row[label] = iR % RANGE
    })
    result.push(row)
  }
  return result
}

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

const buildCols = (nRows, labels) => {
  const result = {}
  labels.forEach(label => {
    result[label] = []
    for (let iR = 0; iR < nRows; iR += 1) {
      result[label].push(iR % RANGE)
    }
  })
  return result
}

const colFilter = (table, func) => {
  const result = {}
  const labels = Object.keys(result)
  labels.forEach(label => {
    result[label] = []
  })
  for (let iR = 0; iR < table.c1.length; iR += 1) {
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

const calculateRatio = (filterPerSelect,
  rowFilterTime, rowSelectTime,
  colFilterTime, colSelectTime) => {
  return ((filterPerSelect * rowFilterTime) + rowSelectTime) /
    ((filterPerSelect * colFilterTime) + colSelectTime)
}

main()
