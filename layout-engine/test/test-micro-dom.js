const assert = require('assert')

const { TextNode, TagNode } = require('../micro-dom')

describe('MicroDOM nodes behave properly', () => {
  it('creates text nodes with text', async () => {
    const node = new TextNode('some text')
    assert.strictEqual(node._text, 'some text')
  })

  it('refuses to create text nodes with anything other than text', async () => {
    assert.throws(() => new TextNode(123))
  })

  it('converts a text node to a string', async () => {
    const node = new TextNode('something')
    assert.strictEqual(node.toString(), 'something')
  })

  it('creates element nodes without attributes or children', async () => {
    const node = new TagNode('p', null)
    assert.strictEqual(node._tag, 'p')
    assert.deepStrictEqual(node._attributes, {})
    assert.deepStrictEqual(node._children, [])
  })

  it('creates element nodes with attributes but no children', async () => {
    const attrs = { left: 'leftValue', right: 'rightValue' }
    const node = new TagNode('p', attrs)
    assert.strictEqual(node._tag, 'p')
    assert.deepStrictEqual(node._attributes, attrs)
    assert.deepStrictEqual(node._children, [])
  })

  it('creates element nodes with children but no attributes', async () => {
    const children = [
      new TextNode('text'),
      new TagNode('span', null)
    ]
    const node = new TagNode('p', null, ...children)
    assert.strictEqual(node._tag, 'p')
    assert.deepStrictEqual(node._attributes, {})
    assert.deepStrictEqual(node._children, children)
  })

  it('creates element nodes with attributes and children', async () => {
    const attrs = { left: 'leftValue', right: 'rightValue' }
    const children = [
      new TextNode('text'),
      new TagNode('span', null)
    ]
    const node = new TagNode('p', attrs, ...children)
    assert.strictEqual(node._tag, 'p')
    assert.deepStrictEqual(node._attributes, attrs)
    assert.deepStrictEqual(node._children, children)
  })

  it('converts nested nodes to string', async () => {
    const attrs = { left: 'leftValue', right: 'rightValue' }
    const children = [
      new TextNode('text'),
      new TagNode('span', null)
    ]
    const node = new TagNode('p', attrs, ...children)
    const actual = node.toString()
    const expected = '<p left="leftValue" right="rightValue">text<span></span></p>'
    assert.strictEqual(actual, expected)
  })
})
