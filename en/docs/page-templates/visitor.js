import assert from 'assert'

class Visitor {
  constructor (root) {
    this.root = root
  }

  walk (node = null) {
    if (node === null) {
      node = this.root
    }
    if (this.open(node)) {
      node.children.forEach(child => {
        this.walk(child)
      })
    }
    this.close(node)
  }

  open (node) {
    assert(false,
      'Must implemented "open"')
  }

  close (node) {
    assert(false,
      'Must implemented "close"')
  }
}

export default Visitor
