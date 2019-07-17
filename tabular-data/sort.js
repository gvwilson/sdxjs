  sort (columns, reverse = false) {
    assert(columns.length > 0,
           `no columns specified for sort`)
    assert(this.hasColumns(columns),
           `unknown column(s) [${columns}] in sort`)
    const result = [...this.data]
    result.sort((left, right) => {
      return columns.reduce((soFar, col) => {
        if (soFar !== 0) {
          return soFar
        }
        if (left[col] === DataFrame.MISSING) {
          return -1
        }
        if (right[col] === DataFrame.MISSING) {
          return 1
        }
        if (left[col] < right[col]) {
          return -1
        }
        if (left[col] > right[col]) {
          return 1
        }
        return 0
      }, 0)
    })
    if (reverse) {
      result.reverse()
    }
    return new DataFrame(result, this.columns)
  }
