const assert = require('assert')

class Visitor {
  constructor (root) {
    this.root = root
  }

  walk (node) {
    if (node === undefined) {
      node = this.root
    }
    if (this.open(node)) {
      node.childNodes.forEach(child => {
        this.walk(child)
      })
    }
    this.close(node)
  }

  open (node) {
    assert(false,
           `Must implemented 'open'`)
  }

  close (node) {
    assert(false,
           `Must implemented 'close'`)
  }
}

module.exports = Visitor
