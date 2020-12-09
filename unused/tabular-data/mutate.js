  mutate (newName, expr) {
    assert(newName,
           `empty new column name for mutate`)
    assert(newName.match(DataFrame.COLUMN_NAME),
           `illegal new name for column`)
    assert(typeof expr === 'function',
           `new value expression is not a function`)
    const newData = this.data.map((row, i) => {
      const newRow = {...row}
      newRow[newName] = expr(row, i)
      return newRow
    })
    const newColumns = this._makeColumns(newData, this.columns, {add: [newName]})
    return new DataFrame(newData, newColumns)
  }
