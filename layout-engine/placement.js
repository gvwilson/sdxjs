class Column {
  constructor (...children) {
    this._children = children
  }

  width () {
    return Math.max(...this._children.map(child => child.width()))
  }

  height () {
    return this._children
      .map(child => child.height())
      .reduce((total, next) => total + next, 0)
  }

  place (x0, y1) {
    this._x0 = x0
    this._y1 = y1
    let yCurrent = this._y1
    this.children.forEach(child => {
      child.place(x0, yCurrent)
      yCurrent += child.height()
    })
  }

  report () {
    return [
      'column', this._x0, this._y1,
      ...this.children.map(child => child.report())
    ]
  }
}

module.exports = { Block, Row, Column }
