  groupBy (columns) {
    assert(columns.length > 0,
           `empty column name(s) for grouping`)
    assert(this.hasColumns(columns),
           `unknown column(s) ${columns} in groupBy`)
    assert(columns.length === (new Set(columns)).size,
           `duplicate column(s) in [${columns}] in groupBy`)
    const seen = new Map()
    let nextGroupId = 1
    const groupedData = this.data.map((row, i) => {
      const thisGroupId = this._makeGroupId(seen, row, i, columns, nextGroupId)
      if (thisGroupId === nextGroupId) {
        nextGroupId += 1
      }
      const newRow = {...row}
      newRow[DataFrame.GROUPCOL] = thisGroupId
      return newRow
    })
    const newColumns = this._makeColumns(groupedData, this.columns,
                                         {add: [DataFrame.GROUPCOL]})
    return new DataFrame(groupedData, newColumns)
  }

  ungroup () {
    assert(this.hasColumns([DataFrame.GROUPCOL]),
           `cannot ungroup data that is not grouped`)
    const newData = this.data.map(row => {
      row = {...row}
      delete row[DataFrame.GROUPCOL]
      return row
    })
    const newColumns = this._makeColumns(newData, this.columns,
                                         {remove: [DataFrame.GROUPCOL]})
    return new DataFrame(newData, newColumns)
  }
