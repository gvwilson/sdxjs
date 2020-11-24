import assert from 'assert'

import { Block } from '../placed-block.js'
import { Row } from '../placed-row.js'
import { Column } from '../placed-column.js'

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

  it('lays out a row of two blocks', async () => {
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

  it('lays out a column of two blocks', async () => {
    const fixture = new Column(
      new Block(1, 1),
      new Block(2, 4)
    )
    fixture.place(0, 0)
    assert.deepStrictEqual(
      fixture.report(),
      ['column', 0, 0, ['block', 0, 0], ['block', 0, -1]]
    )
  })

  // <large>
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
    fixture.place(0, 0)
    assert.deepStrictEqual(
      fixture.report(),
      ['column', 0, 0,
        ['row', 0, 0, ['block', 0, -2], ['block', 1, 0]],
        ['row', 0, -4,
          ['block', 0, -16],
          ['column', 5, -4, ['block', 5, -4], ['block', 5, -12]]
        ]
      ]
    )
  })
  // </large>
})
