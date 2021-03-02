import assert from 'assert'

import {
  RenderedBlock as Block,
  RenderedCol as Col,
  RenderedRow as Row
} from '../rendered.js'
import render from '../render.js'

describe('renders blocks', () => {
  it('renders a single unit block', async () => {
    const fixture = new Block(1, 1)
    fixture.place(0, 0)
    assert.deepStrictEqual(
      render(fixture),
      'a'
    )
  })

  it('renders a large block', async () => {
    const fixture = new Block(3, 4)
    fixture.place(0, 0)
    assert.deepStrictEqual(
      render(fixture),
      [
        'aaa',
        'aaa',
        'aaa',
        'aaa'
      ].join('\n')
    )
  })

  it('renders a row of two blocks', async () => {
    const fixture = new Row(
      new Block(1, 1),
      new Block(2, 4)
    )
    fixture.place(0, 0)
    assert.deepStrictEqual(
      render(fixture),
      [
        'acc',
        'acc',
        'acc',
        'bcc'
      ].join('\n')
    )
  })

  it('renders a column of two blocks', async () => {
    const fixture = new Col(
      new Block(1, 1),
      new Block(2, 4)
    )
    fixture.place(0, 0)
    assert.deepStrictEqual(
      render(fixture),
      [
        'ba',
        'cc',
        'cc',
        'cc',
        'cc'
      ].join('\n')
    )
  })

  // [large]
  it('renders a grid of rows of columns', async () => {
    const fixture = new Col(
      new Row(
        new Block(1, 2),
        new Block(3, 4)
      ),
      new Row(
        new Block(1, 2),
        new Col(
          new Block(3, 4),
          new Block(2, 3)
        )
      )
    )
    fixture.place(0, 0)
    assert.deepStrictEqual(
      render(fixture),
      [
        'bddd',
        'bddd',
        'cddd',
        'cddd',
        'ehhh',
        'ehhh',
        'ehhh',
        'ehhh',
        'eiig',
        'fiig',
        'fiig'
      ].join('\n')
    )
  })
  // [/large]
})
