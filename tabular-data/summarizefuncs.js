  static Count (column, rows) {
    return rows.length
  }

  static Maximum (column, rows) {
    if (rows.length === 0) {
      return DataFrame.MISSING
    }
    return rows.reduce((soFar, row) => {
      return (row[column] > soFar) ? row[column] : soFar
    }, rows[0][column])
  }

  static Mean (column, rows) {
    if (rows.length === 0) {
      return DataFrame.MISSING
    }
    return rows.reduce((total, row) => {
      return total + row[column]
    }, 0) / rows.length
  }

  static Median (column, rows) {
    if (rows.length === 0) {
      return DataFrame.MISSING
    }
    const temp = [...rows]
    temp.sort((left, right) => {
      if (left[column] < right[column]) {
        return -1
      }
      else if (left[column] > right[column]) {
        return 1
      }
      return 0
    })
    return temp[Math.floor(rows.length / 2)][column]
  }

  static Minimum (column, rows) {
    if (rows.length === 0) {
      return DataFrame.MISSING
    }
    return rows.reduce((soFar, row) => {
      return (row[column] < soFar) ? row[column] : soFar
    }, rows[0][column])
  }

  static StdDev (column, rows) {
    if (rows.length === 0) {
      return DataFrame.MISSING
    }
    return Math.sqrt(DataFrame.Variance(column, rows))
  }

  static Sum (column, rows) {
    if (rows.length === 0) {
      return DataFrame.MISSING
    }
    return rows.reduce((total, row) => {
      return total + row[column]
    }, 0)
  }

  static Variance (column, rows) {
    if (rows.length === 0) {
      return DataFrame.MISSING
    }
    const mean = rows.reduce((total, row) => total + row[column], 0) / rows.length
    const diffSq = rows.map(row => (row[column] - mean) ** 2)
    const result = diffSq.reduce((total, val) => total + val, 0) / diffSq.length
    return result
  }
