// Visit DOM nodes.
class Visitor {
  constructor (root) {
    this.root = root
  }

  walk (node) {
    if (node === undefined) {
      node = this.root
    }
    if (node instanceof Array) {
      for (let child of node) {
        this.walk(child)
      }
    }
    else if (node instanceof Object) {
      if (this.open(node)) {
        if ('children' in node) {
          this.walk(node.children)
        }
        this.close(node)
      }
    }
    else {
      throw new Error(`unknown node ${node}`)
    }
  }

  open (node) {
    return true
  }

  close (node) {}
}

module.exports = Visitor
