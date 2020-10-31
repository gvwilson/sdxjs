const assert = require('assert')

const Visitor = require('./visitor')
const Env = require('./env')

const HANDLERS = {
  'q-if': require('./q-if'),
  'q-loop': require('./q-loop'),
  'q-num': require('./q-num'),
  'q-var': require('./q-var')
}

class Expander extends Visitor {
  constructor (root, vars) {
    super(root)
    this.env = new Env(vars)
    this.handlers = HANDLERS
    this.result = []
  }

  getResult () {
    return this.result.join('')
  }

  open (node) {
    if (node.type === 'text') {
      this.output(node.data)
      return false
    } else if (this.hasHandler(node)) {
      return this.getHandler(node).open(this, node)
    } else {
      this.showTag(node, false)
      return true
    }
  }

  close (node) {
    if (node.type === 'text') {
      return
    }
    if (this.hasHandler(node)) {
      this.getHandler(node).close(this, node)
    } else {
      this.showTag(node, true)
    }
  }

  hasHandler (node) {
    for (const name in node.attribs) {
      if (name in this.handlers) {
        return true
      }
    }
    return false
  }

  getHandler (node) {
    const possible = Object.keys(node.attribs)
      .filter(name => name in this.handlers)
    assert(possible.length === 1,
      'Should be exactly one handler')
    return this.handlers[possible[0]]
  }

  showTag (node, closing) {
    if (closing) {
      this.output(`</${node.name}>`)
      return
    }

    this.output(`<${node.name}`)
    for (const name in node.attribs) {
      if (!name.startsWith('q-')) {
        this.output(` ${name}="${node.attribs[name]}"`)
      }
    }
    this.output('>')
  }

  output (text) {
    this.result.push((text === undefined) ? 'UNDEF' : text)
  }
}

module.exports = Expander
