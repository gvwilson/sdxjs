import assert from 'assert'

import {
  Block,
  Row,
  Col
} from '../easy-mode.js'

describe('lays out in easy mode', () => {
  it('lays out a single unit block', async () => {
    const fixture = new Block(1, 1)
    assert.strictEqual(fixture.getWidth(), 1)
    assert.strictEqual(fixture.getHeight(), 1)
  })

  it('lays out a large block', async () => {
    const fixture = new Block(3, 4)
    assert.strictEqual(fixture.getWidth(), 3)
    assert.strictEqual(fixture.getHeight(), 4)
  })

  it('lays out a row of two blocks', async () => {
    const fixture = new Row(
      new Block(1, 1),
      new Block(2, 4)
    )
    assert.strictEqual(fixture.getWidth(), 3)
    assert.strictEqual(fixture.getHeight(), 4)
  })

  it('lays out a column of two blocks', async () => {
    const fixture = new Col(
      new Block(1, 1),
      new Block(2, 4)
    )
    assert.strictEqual(fixture.getWidth(), 2)
    assert.strictEqual(fixture.getHeight(), 5)
  })

  it('lays out a grid of rows of columns', async () => {
    const fixture = new Col(
      new Row(
        new Block(1, 2),
        new Block(3, 4)
      ),
      new Row(
        new Block(5, 6),
        new Col(
          new Block(7, 8),
          new Block(9, 10)
        )
      )
    )
    assert.strictEqual(fixture.getWidth(), 14)
    assert.strictEqual(fixture.getHeight(), 22)
  })
})
