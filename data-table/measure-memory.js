const main = () => {
  const which = process.argv[2]
  const numRows = parseInt(process.argv[3])
  const numCols = parseInt(process.argv[4])
  if (which === 'rows') {
    console.log(`by rows ${numRows} x ${numCols} = ${rowWise(numRows, numCols)}`)
  } else if (which === 'cols') {
    console.log(`by cols ${numRows} x ${numCols} = ${colWise(numRows, numCols)}`)
  } else {
    console.error(`unknown arrangement ${which}`)
  }
}

const rowWise = (numRows, numCols) => {
  const keys = []
  for (let col = 0; col < numCols; col += 1) {
    keys.push(`i${col}`)
  }

  const before = process.memoryUsage()
  const table = []
  for (let row = 0; row < numRows; row += 1) {
    const record = {}
    keys.forEach(k => {
      record[k] = 0
    })
    table.push(record)
  }
  const after = process.memoryUsage()
  return after.heapUsed - before.heapUsed
}

const colWise = (numRows, numCols) => {
  const before = process.memoryUsage()
  const table = {}
  for (let col = 0; col < numCols; col += 1) {
    const column = Array(numRows).fill(0)
    table[`i${col}`] = column
  }
  const after = process.memoryUsage()
  return after.heapUsed - before.heapUsed
}

main()
