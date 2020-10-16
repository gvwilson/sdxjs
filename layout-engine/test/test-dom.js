const assert = require('assert')

const { TextNode, TagNode } = require('../dom')

describe('SOM nodes behave properly', () => {
  it('creates text nodes with text', async () => {
    const node = new TextNode('some text')
    assert.strictEqual(node.text, 'some text',
      'Wrong text in node')
  })

  it('refuses to create text nodes with anything other than text', async () => {
    assert.throws(() => new TextNode(123),
      'Should require text')
  })

  it('converts a text node to a string', async () => {
    const node = new TextNode('something')
    assert.strictEqual(node.toString(), 'something',
      'Wrong string for text node')
  })

  it('creates element nodes without attributes or children', async () => {
    const node = new TagNode('p', null, null)
    assert.strictEqual(node.tag, 'p',
      'Wrong tag in node')
    assert.deepStrictEqual(node.attributes, {},
      'Wrong attributes in node')
    assert.deepStrictEqual(node.children, [],
      'Wrong children in node')
  })

  it('creates element nodes with attributes but no children', async () => {
    const attrs = { left: 'leftValue', right: 'rightValue' }
    const node = new TagNode('p', attrs, null)
    assert.strictEqual(node.tag, 'p',
      'Wrong tag in node')
    assert.deepStrictEqual(node.attributes, attrs,
      'Wrong attributes in node')
    assert.deepStrictEqual(node.children, [],
      'Wrong children in node')
  })

  it('creates element nodes with children but no attributes', async () => {
    const children = [new TextNode('text'),
      new TagNode('span', null, null)]
    const node = new TagNode('p', null, children)
    assert.strictEqual(node.tag, 'p',
      'Wrong tag in node')
    assert.deepStrictEqual(node.attributes, {},
      'Wrong attributes in node')
    assert.deepStrictEqual(node.children, children,
      'Wrong children in node')
  })

  it('creates element nodes with attributes and children', async () => {
    const attrs = { left: 'leftValue', right: 'rightValue' }
    const children = [new TextNode('text'),
      new TagNode('span', null, null)]
    const node = new TagNode('p', attrs, children)
    assert.strictEqual(node.tag, 'p',
      'Wrong tag in node')
    assert.deepStrictEqual(node.attributes, attrs,
      'Wrong attributes in node')
    assert.deepStrictEqual(node.children, children,
      'Wrong children in node')
  })

  it('converts nested nodes to string', async () => {
    const attrs = { left: 'leftValue', right: 'rightValue' }
    const children = [new TextNode('text'),
      new TagNode('span', null, null)]
    const node = new TagNode('p', attrs, children)
    const actual = node.toString()
    const expected = '<p left="leftValue" right="rightValue">text<span></span></p>'
    assert.strictEqual(actual, expected,
      'Wrong string representation of nested nodes')
  })
})
