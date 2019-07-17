  _addFieldsExcept (result, row, tableName, exceptName) {
    Object.keys(row)
      .filter(key => (key !== exceptName))
      .forEach(key => { result[`${tableName}_${key}`] = row[key] })
  }

  _addColumnsExcept (result, tableName, columns, exceptName) {
    Array.from(columns)
      .filter(col => (col !== exceptName))
      .forEach(col => result.push(`${tableName}_${col}`))
    return result
  }
