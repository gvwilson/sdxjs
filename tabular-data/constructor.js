  constructor (values, oldColumns = null) {
    this._checkData(values)
    this.data = values
    this.columns = this._makeColumns(values, oldColumns)
  }

  _checkData (values) {
    assert(Array.isArray(values),
           `Values used to construct dataframe must be an array, not ${typeof values}`)
    if (values.length === 0) {
      return
    }
    const expected = new Set(Object.keys(values[0]))
    expected.forEach(name => {
      assert(name.match(DataFrame.COLUMN_NAME) || DataFrame.SPECIAL_NAMES.has(name),
             `Column name "${name}" not allowed`)
    })
    values.forEach((row, index) => {
      const keys = Object.keys(row)
      assert(keys.length === expected.size,
             `Row ${index} has wrong number of columns`)
      assert(keys.every(k => expected.has(k)),
             `Row ${index} has wrong column name(s)`)
    })
  }
