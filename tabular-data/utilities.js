  // Test whether the dataframe has the specified columns.
  hasColumns (names) {
    assert(Array.isArray(names),
           `require array of names`)
    return (names.length <= this.columns.size)
      && names.every(n => (this.columns.has(n)))
  }

  // Create columns for new table from data, existing columns, and explict add/remove lists.
  _makeColumns (data, oldColumns, extras = {}) {
    const result = new Set()

    // Trust the data if there is some.
    if (data.length > 0) {
      Object.keys(data[0]).forEach(key => result.add(key))
    }

    // Construct.
    else {
      if (oldColumns) {
        oldColumns.forEach(name => result.add(name))
      }
      if ('add' in extras) {
        extras.add.forEach(name => result.add(name))
      }
    }

    return result
  }
