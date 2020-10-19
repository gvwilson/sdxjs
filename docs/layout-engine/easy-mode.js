class Block {
  constructor (width, height) {
    this._width = width
    this._height = height
  }

  width () {
    return this._width
  }

  height () {
    return this._height
  }
}

class Row {
  constructor (...children) {
    this._children = children
  }

  width () {
    return this._children
      .map(child => child.width())
      .reduce((total, next) => total + next, 0)
  }

  height () {
    return Math.max(...this._children.map(child => child.height()))
  }
}

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
}

module.exports = { Block, Row, Column }
