const microtime = require('microtime')

const main = () => {
  const which = process.argv[2]
  const numRows = parseInt(process.argv[3])
  const numCols = parseInt(process.argv[4])
  if (which === 'rows') {
    const table = makeRowWise(numRows, numCols)
    console.log(`filter,rows,${numRows},${numCols},${time(filterRows, table)}`)
    console.log(`select,rows,${numRows},${numCols},${time(selectRows, table)}`)
  } else if (which === 'cols') {
    const table = makeColWise(numRows, numCols)
    console.log(`filter,cols,${numRows},${numCols},${time(filterCols, table)}`)
    console.log(`select,cols,${numRows},${numCols},${time(selectCols, table)}`)
  } else {
    console.error(`unknown arrangement ${which}`)
  }
}

const makeRowWise = (numRows, numCols) => {
  const keys = []
  for (let col = 0; col < numCols; col += 1) {
    keys.push(`i${col}`)
  }
  const table = []
  for (let row = 0; row < numRows; row += 1) {
    const record = {}
    keys.forEach(k => {
      record[k] = row % 3
    })
    table.push(record)
  }
  return table
}

const makeColWise = (numRows, numCols) => {
  const column = []
  for (let row = 0; row < numRows; row += 1) {
    column.push(row % 3)
  }
  const table = {}
  for (let col = 0; col < numCols; col += 1) {
    table[`i${col}`] = [...column]
  }
  return table
}

const time = (func, table) => {
  const start = microtime.now()
  func(table)
  const end = microtime.now()
  return end - start
}

const filterRows = (table) => {
  const key = 'i0'
  const result = table.filter(row => row[key] === 0)
  return result
}

const selectRows = (table) => {
  const keep = Object.keys(table[0]).filter((key, i) => {
    return (i % 3) === 0
  })
  const result = table.map(row => {
    const newRow = {}
    keep.forEach(key => {
      newRow[key] = row[key]
    })
    return newRow
  })
  return result
}

const filterCols = (table) => {
  const allKeys = Object.keys(table)
  const result = {}
  allKeys.forEach(key => {
    result[key] = []
  })
  const key = 'i0'
  table[key].forEach((value, i) => {
    if (value === 0) {
      for (const k of allKeys) {
        result[k].push(table[k][i])
      }
    }
  })
  return result
}

const selectCols = (table) => {
  const result = {}
  Object.keys(table).forEach((key, i) => {
    if ((i % 3) === 0) {
      result[key] = table[key]
    }
  })
  return result
}

main()
