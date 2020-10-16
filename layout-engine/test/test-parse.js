const assert = require('assert')

const { TextNode, TagNode } = require('../dom')
const { parseHTML } = require('../parse')

describe('parses HTML', () => {
  it('parses a single tag', async () => {
    const text = '<a></a>'
    const actual = parseHTML(text)
    const expected = new TagNode('a', {}, [])
    assert.deepStrictEqual(actual, expected,
      'Failed to parse a simple node')
  })

  it('parses a tag with attributes', async () => {
    const text = '<a k1="v1" k2="v2"></a>'
    const actual = parseHTML(text)
    const expected = new TagNode('a', { k1: 'v1', k2: 'v2' }, [])
    assert.deepStrictEqual(actual, expected,
      'Failed to parse a node with attributes')
  })

  it('parses nodes containing text', async () => {
    const text = '<a> contents </a>'
    const actual = parseHTML(text)
    const expected = new TagNode('a', {}, [new TextNode(' contents ')])
    assert.deepStrictEqual(actual, expected,
      'Failed to parse a node with text content')
  })

  it('parses nested nodes', async () => {
    const text = '<a><b1></b1><b2><c></c></b2></a>'
    const actual = parseHTML(text)
    const expected = new TagNode('a', {}, [
      new TagNode('b1', {}, []),
      new TagNode('b2', {}, [
        new TagNode('c', {}, [])
      ])
    ])
    assert.deepStrictEqual(actual, expected,
      'Failed to parse nested nodes')
  })

  it('complains about unclosed tags', async () => {
    const text = '<a</a>'
    assert.throws(() => parseHTML(text),
      Error,
      'Expected error for unclosed tag')
  })

  it('complains about mismatched tags', async () => {
    const text = '<a><b></a>'
    assert.throws(() => parseHTML(text),
      Error,
      'Expected error for mismatched tag')
  })

  it('complains about dangling nodes', async () => {
    const text = '<a></a><b></b>'
    assert.throws(() => parseHTML(text),
      Error,
      'Expected error for dangling tags')
  })
})
