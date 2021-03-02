import microtime from 'microtime'
import sizeof from 'object-sizeof'

// [build-rows]
export const buildRows = (nRows, labels) => {
  const result = []
  for (let iR = 0; iR < nRows; iR += 1) {
    const row = {}
    labels.forEach(label => {
      row[label] = iR
    })
    result.push(row)
  }
  return result
}
// [/build-rows]

// [build-cols]
export const buildCols = (nRows, labels) => {
  const result = {}
  labels.forEach(label => {
    result[label] = []
    for (let iR = 0; iR < nRows; iR += 1) {
      result[label].push(iR)
    }
  })
  return result
}
// [/build-cols]

export const timeAndSize = (func, ...params) => {
  const before = microtime.now()
  const result = func(...params)
  const after = microtime.now()
  return [after - before, sizeof(result)]
}
