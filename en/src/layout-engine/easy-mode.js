// [block]
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
// [/block]

// [row]
export class Row {
  constructor (...children) {
    this.children = children
  }

  getWidth () {
    let result = 0
    for (const child of this.children) {
      result += child.getWidth()
    }
    return result
  }

  getHeight () {
    let result = 0
    for (const child of this.children) {
      result = Math.max(result, child.getHeight())
    }
    return result
  }
}
// [/row]

// [col]
export class Col {
  constructor (...children) {
    this.children = children
  }

  getWidth () {
    let result = 0
    for (const child of this.children) {
      result = Math.max(result, child.getWidth())
    }
    return result
  }

  getHeight () {
    let result = 0
    for (const child of this.children) {
      result += child.getHeight()
    }
    return result
  }
}
// [/col]
