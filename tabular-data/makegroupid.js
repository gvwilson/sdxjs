  _makeGroupId (seen, row, i, columns, nextGroupId) {
    const thisValue = row[columns[0]]
    const otherColumns = columns.slice(1)
    if (seen.has(thisValue)) {
      if (otherColumns.length === 0) {
        return seen.get(thisValue)
      }
      else {
        const subMap = seen.get(thisValue)
        return this._makeGroupId(subMap, row, i, otherColumns, nextGroupId)
      }
    }
    else {
      if (otherColumns.length === 0) {
        seen.set(thisValue, nextGroupId)
        return nextGroupId
      }
      else {
        const subMap = new Map()
        seen.set(thisValue, subMap)
        return this._makeGroupId(subMap, row, i, otherColumns, nextGroupId)
      }
    }
  }
