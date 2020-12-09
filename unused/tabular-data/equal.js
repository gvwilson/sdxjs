  equal (other) {
    assert(other instanceof DataFrame,
           `Can only compare dataframes with dataframes`)

    const cols = Array.from(this.columns.keys())

    if (this.columns.size !== other.columns.size) {
      return false
    }
    if (!cols.every(column => other.columns.has(column))) {
      return false
    }

    if (this.data.length !== other.data.length) {
      return false
    }
    if (this.data.length === 0) {
      return true
    }

    const compare = (left, right) => {
      for (const k of cols) {
        if (left[k] < right[k]) {
          return -1
        }
        if (left[k] > right[k]) {
          return 1
        }
      }
      return 0
    }
    const thisRows = this.data.slice().sort(compare)
    const otherRows = other.data.slice().sort(compare)
    return thisRows.every((row, i) => cols.every(k => (thisRows[i][k] === otherRows[i][k])))
  }
