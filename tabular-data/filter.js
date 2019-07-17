  filter (expr) {
    assert(typeof expr === 'function',
           `filter expression is not a function`)
    const newData = this.data.filter((row, i) => expr(row, i))
    const newColumns = this._makeColumns(newData, this.columns)
    return new DataFrame(newData, newColumns)
  }
