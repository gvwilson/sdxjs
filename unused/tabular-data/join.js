  join (thisName, thisCol, other, otherName, otherCol) {
    assert(thisName.match(DataFrame.TABLE_NAME),
           `cannot use ${thisName} as table name`)
    assert(this.hasColumns([thisCol]),
           `this does not have column ${thisCol}`)
    assert(other instanceof DataFrame,
           `other table must be a dataframe`)
    assert(otherName.match(DataFrame.TABLE_NAME),
           `cannot use ${otherName} as table name`)
    assert(other.hasColumns([otherCol]),
           `other table does not have column ${otherCol}`)

    const result = []
    for (let thisRow of this.data) { 
      for (let otherRow of other.data) { 
        if (thisRow[thisCol] === otherRow[otherCol]) {
          const row = {}
          row[DataFrame.JOINCOL] = thisRow[thisCol]
          this._addFieldsExcept(row, thisRow, thisName, thisCol)
          this._addFieldsExcept(row, otherRow, otherName, otherCol)
          result.push(row)
        }
      }
    }

    const newColumns = [DataFrame.JOINCOL]
    this._addColumnsExcept(newColumns, thisName, this.columns, thisCol)
    this._addColumnsExcept(newColumns, otherName, other.columns, otherCol)

    return new DataFrame(result, newColumns)
  }
