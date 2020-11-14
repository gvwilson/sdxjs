// <build-rows>
const RANGE = 3

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
// </build-rows>

// <build-cols>
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
// </build-cols>

module.exports = {
  buildRows,
  buildCols
}
