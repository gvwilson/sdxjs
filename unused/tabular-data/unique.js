  unique (columns) {
    assert(columns.length > 0,
           `no columns specified for select`)
    assert(this.hasColumns(columns),
           `unknown column(s) [${columns}] in select`)
    const seen = new Map()
    const newData = []
    this.data.forEach((row, i) => this._findUnique(seen, newData, row, i, columns))
    return new DataFrame(newData, columns)
  }

  _findUnique (seen, newData, row, i, columns) {
    const thisValue = row[columns[0]]
    const otherColumns = columns.slice(1)
    if (otherColumns.length === 0) {
      if (!seen.has(thisValue)) {
        seen.set(thisValue, true)
        newData.push(row)
      }
    }
    else {
      if (!seen.has(thisValue)) {
        seen.set(thisValue, new Map())
      }
      this._findUnique(seen.get(thisValue), newData, row, i, otherColumns)
    }
  }
