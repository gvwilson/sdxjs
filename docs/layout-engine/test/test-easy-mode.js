const assert = require('assert')

const { Block, Row, Column } = require('../easy-mode')

describe('lays out in easy mode', () => {
  it('lays out a single unit block', async () => {
    const fixture = new Block(1, 1)
    assert.equal(fixture.width(), 1)
    assert.equal(fixture.height(), 1)
  })

  it('lays out a large block', async () => {
    const fixture = new Block(3, 4)
    assert.equal(fixture.width(), 3)
    assert.equal(fixture.height(), 4)
  })

  it('lays out a row of two blocks', async () => {
    const fixture = new Row(
      new Block(1, 1),
      new Block(2, 4)
    )
    assert.equal(fixture.width(), 3)
    assert.equal(fixture.height(), 4)
  })

  it('lays out a column of two blocks', async () => {
    const fixture = new Column(
      new Block(1, 1),
      new Block(2, 4)
    )
    assert.equal(fixture.width(), 2)
    assert.equal(fixture.height(), 5)
  })

  it('lays out a grid of rows of columns', async () => {
    const fixture = new Column(
      new Row(
        new Block(1, 2),
        new Block(3, 4)
      ),
      new Row(
        new Block(5, 6),
        new Column(
          new Block(7, 8),
          new Block(9, 10)
        )
      )
    )
    assert.equal(fixture.width(), 14)
    assert.equal(fixture.height(), 22)
  })
})
