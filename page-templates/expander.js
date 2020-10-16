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
    if (node.nodeName === '#text') {
      this.output(node.value)
      return false
    }

    if (this.hasHandler(node)) {
      return this.getHandler(node).open(this, node)
    }

    this.showTag(node, false)
    return true
  }

  close (node) {
    if (node.nodeName === '#text') {
      return
    }
    if (this.hasHandler(node)) {
      this.getHandler(node).close(this, node)
    } else {
      this.showTag(node, true)
    }
  }

  hasHandler (node) {
    return ('attrs' in node) &&
      node.attrs.some(({ name, value }) => name in this.handlers)
  }

  getHandler (node) {
    assert('attrs' in node,
      'Node does not have attributes')
    const possible = node.attrs.filter(({ name, value }) => name in this.handlers)
    assert(possible.length === 1,
      'Should be exactly one handler')
    return this.handlers[possible[0].name]
  }

  showTag (node, closing) {
    if (closing) {
      this.output(`</${node.nodeName}>`)
      return
    }

    this.output(`<${node.nodeName}`)
    node.attrs.forEach(({ name, value }) => {
      if (!name.startsWith('q-')) {
        this.output(` ${name}="${value}"`)
      }
    })
    this.output('>')
  }

  output (text) {
    this.result.push((text === undefined) ? 'UNDEF' : text)
  }
}

module.exports = Expander
