import assert from 'assert'

import Visitor from './visitor.js'
import Env from './env.js'

import z_if from './z-if.js'
import z_loop from './z-loop.js'
import z_num from './z-num.js'
import z_var from './z-var.js'

const HANDLERS = {
  'z-if': z_if,
  'z-loop': z_loop,
  'z-num': z_num,
  'z-var': z_var
}

class Expander extends Visitor {
  constructor (root, vars) {
    super(root)
    this.env = new Env(vars)
    this.handlers = HANDLERS
    this.result = []
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

  // [skip]
  // [handlers]
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
  // [/handlers]

  // [helpers]
  showTag (node, closing) {
    if (closing) {
      this.output(`</${node.name}>`)
      return
    }

    this.output(`<${node.name}`)
    if (node.name === 'body') {
      this.output(' style="font-size: 200%; margin-left: 0.5em"')
    }
    for (const name in node.attribs) {
      if (!name.startsWith('z-')) {
        this.output(` ${name}="${node.attribs[name]}"`)
      }
    }
    this.output('>')
  }

  output (text) {
    this.result.push((text === undefined) ? 'UNDEF' : text)
  }

  getResult () {
    return this.result.join('')
  }
  // [/helpers]
  // [/skip]
}

export default Expander
