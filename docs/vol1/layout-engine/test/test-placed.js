import assert from 'assert'

import {
  PlacedBlock as Block,
  PlacedCol as Col,
  PlacedRow as Row
} from '../placed.js'

describe('places blocks', () => {
  it('places a single unit block', async () => {
    const fixture = new Block(1, 1)
    fixture.place(0, 0)
    assert.deepStrictEqual(
      fixture.report(),
      ['block', 0, 0]
    )
  })

  it('places a large block', async () => {
    const fixture = new Block(3, 4)
    fixture.place(0, 0)
    assert.deepStrictEqual(
      fixture.report(),
      ['block', 0, 0]
    )
  })

  it('places a row of two blocks', async () => {
    const fixture = new Row(
      new Block(1, 1),
      new Block(2, 4)
    )
    fixture.place(0, 0)
    assert.deepStrictEqual(
      fixture.report(),
      ['row', 0, 0, ['block', 0, -3], ['block', 1, 0]]
    )
  })

  it('places a column of two blocks', async () => {
    const fixture = new Col(
      new Block(1, 1),
      new Block(2, 4)
    )
    fixture.place(0, 0)
    assert.deepStrictEqual(
      fixture.report(),
      ['col', 0, 0, ['block', 0, 0], ['block', 0, -1]]
    )
  })

  // <large>
  it('places a grid of rows of columns', async () => {
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
    fixture.place(0, 0)
    assert.deepStrictEqual(
      fixture.report(),
      ['col', 0, 0,
        ['row', 0, 0, ['block', 0, -2], ['block', 1, 0]],
        ['row', 0, -4,
          ['block', 0, -16],
          ['col', 5, -4, ['block', 5, -4], ['block', 5, -12]]
        ]
      ]
    )
  })
  // </large>
})
