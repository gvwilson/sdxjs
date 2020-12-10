import assert from 'assert'

import {
  DomBlock,
  DomCol,
  DomRow
} from '../micro-dom.js'
import parse from '../parse.js'

describe('parses HTML', () => {
  it('parses a single row', async () => {
    const text = '<row></row>'
    const actual = parse(text)
    const expected = new DomRow({})
    assert.deepStrictEqual(actual, expected)
  })

  it('parses a single column', async () => {
    const text = '<col></col>'
    const actual = parse(text)
    const expected = new DomCol({})
    assert.deepStrictEqual(actual, expected)
  })

  it('parses an element with attributes', async () => {
    const text = '<row k1="v1" k2="v2"></row>'
    const actual = parse(text)
    const expected = new DomRow({ k1: 'v1', k2: 'v2' })
    assert.deepStrictEqual(actual, expected)
  })

  it('parses an element with text', async () => {
    const lines = 'first\nsecond\nthird'
    const expected = new DomCol({}, new DomBlock(lines))
    const text = `<col>${lines}</col>`
    const actual = parse(text)
    assert.deepStrictEqual(actual, expected)
  })

  it('parses nested nodes', async () => {
    const lines = 'first\nsecond'
    const text = `<row><col>${lines}</col><col>${lines}</col></row>`
    const actual = parse(text)
    const expected = new DomRow(
      {},
      new DomCol({}, new DomBlock(lines)),
      new DomCol({}, new DomBlock(lines)))
    assert.deepStrictEqual(actual, expected)
  })

  it('complains about poorly-formatted tags', async () => {
    const text = '<row</row>'
    assert.throws(() => parse(text), Error)
  })

  it('complains about unclosed tags', async () => {
    const text = '<a><b></a>'
    assert.throws(() => parse(text), Error)
  })

  it('complains about mismatched tags', async () => {
    const text = '<a></b>'
    assert.throws(() => parse(text), Error)
  })

  it('complains about dangling nodes', async () => {
    const text = '<a></a><b></b>'
    assert.throws(() => parse(text), Error)
  })
})
