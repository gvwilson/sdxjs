export class Block {
  constructor (width, height) {
    this.width = width
    this.height = height
  }

  getWidth () {
    return this.width
  }

  getHeight () {
    return this.height
  }
}

export class Row {
  constructor (...children) {
    this.children = children
  }

  getWidth () {
    return this.children
      .map(child => child.getWidth())
      .reduce((total, next) => total + next, 0)
  }

  getHeight () {
    return Math.max(...this.children.map(child => child.getHeight()))
  }
}

export class Col {
  constructor (...children) {
    this.children = children
  }

  getWidth () {
    return Math.max(...this.children.map(child => child.getWidth()))
  }

  getHeight () {
    return this.children
      .map(child => child.getHeight())
      .reduce((total, next) => total + next, 0)
  }
}
