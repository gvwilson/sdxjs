const assert = require('assert')

class Node {
}

class TextNode extends Node {
  constructor (text) {
    assert(typeof text === 'string',
      'TextNode requires string as constructor argument')
    super()
    this._text = text
  }

  toString () {
    return this._text
  }
}

class TagNode extends Node {
  constructor (tag, attributes, ...children) {
    assert(typeof tag === 'string',
      'TagNode requires string as tag')
    super()
    this._tag = tag

    this._attributes = {}
    if (attributes !== null) {
      assert(typeof attributes === 'object',
        'Require object for attributes')
      this._attributes = Object.assign({}, attributes)
    }

    this._children = children
    assert(this._children.every(child => child instanceof Node),
      'Children must be nodes')
  }

  toString () {
    const attr = Object.keys(this._attributes)
      .sort()
      .map(key => ` ${key}="${this._attributes[key]}"`)
      .join('')
    const children = this._children
      .map(child => child.toString())
      .join('')
    return `<${this._tag}${attr}>${children}</${this._tag}>`
  }
}

module.exports = { Node, TextNode, TagNode }
