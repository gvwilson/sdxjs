  summarize (op, column) {
    assert(typeof op === 'function',
           `Require summarization functions`)
    assert(this.hasColumns([column]),
           `unknown column in summarize`)
    const newData = this.data.map(row => { return {...row} })
    const newCol = `${column}_${op.colName}`
    this._summarizeColumn(newData, op, column, newCol)
    return new DataFrame(newData, [newCol])
  }

  _summarizeColumn (data, op, oldCol, newCol) {
    // Divide values into groups.
    const groups = new Map()
    data.forEach(row => {
      const groupId = (DataFrame.GROUPCOL in row) ? row[DataFrame.GROUPCOL] : null
      if (!groups.has(groupId)) {
        groups.set(groupId, [])
      }
      groups.get(groupId).push(row)
    })

    // Summarize each group.
    for (let groupId of groups.keys()) {
      const result = op(oldCol, groups.get(groupId))
      groups.set(groupId, result)
    }

    // Paste back in each row.
    data.forEach(row => {
      const groupId = (DataFrame.GROUPCOL in row) ? row[DataFrame.GROUPCOL] : null
      row[newCol] = groups.get(groupId)
    })
  }
