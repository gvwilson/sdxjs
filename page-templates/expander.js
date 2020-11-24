import assert from 'assert'

import Visitor from './visitor.js'
import Env from './env.js'

import q_if from './q-if.js'
import q_loop from './q-loop.js'
import q_num from './q-num.js'
import q_var from './q-var.js'

const HANDLERS = {
  'q-if': q_if,
  'q-loop': q_loop,
  'q-num': q_num,
  'q-var': q_var
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

  // <body>
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
  // </body>

  output (text) {
    this.result.push((text === undefined) ? 'UNDEF' : text)
  }
}

export default Expander
