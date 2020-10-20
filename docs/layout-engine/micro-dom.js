const assert = require('assert')

class Node {
}

class TextNode extends Node {
  constructor (text) {
    assert(typeof text === 'string',
      'TextNode requires string as constructor argument')
    super()
    this.text = text
  }

  toString () {
    return this.text
  }
}

class TagNode extends Node {
  constructor (tag, attributes, ...children) {
    assert(typeof tag === 'string',
      'TagNode requires string as tag')
    super()
    this.tag = tag

    this.attributes = {}
    if (attributes !== null) {
      assert(typeof attributes === 'object',
        'Require object for attributes')
      this.attributes = Object.assign({}, attributes)
    }

    this.children = children
    assert(this.children.every(child => child instanceof Node),
      'Children must be nodes')
  }

  toString () {
    const attr = Object.keys(this.attributes)
      .sort()
      .map(key => ` ${key}="${this.attributes[key]}"`)
      .join('')
    const children = this.children
      .map(child => child.toString())
      .join('')
    return `<${this.tag}${attr}>${children}</${this.tag}>`
  }
}

module.exports = { Node, TextNode, TagNode }
