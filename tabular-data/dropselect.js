  drop (columns) {
    assert(this.hasColumns(columns),
           `unknown column(s) [${columns}] in drop`)
    const keep = Array.from(this.columns).filter(c => (!columns.includes(c)))
    return this.select(keep)
  }

  select (columns) {
    assert(this.hasColumns(columns),
           `unknown column(s) [${columns}] in select`)
    // Dropping all columns.
    if (columns.length === 0) {
      return new DataFrame([])
    }
    // Keeping some columns.
    const newData = this.data.map((row, i) => {
      const result = {}
      columns.forEach(key => {
        result[key] = row[key]
      })
      return result
    })
    return new DataFrame(newData, columns)
  }
