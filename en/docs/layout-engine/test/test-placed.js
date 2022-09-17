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
      ['block', 0, 0, 1, 1]
    )
  })

  it('places a large block', async () => {
    const fixture = new Block(3, 4)
    fixture.place(0, 0)
    assert.deepStrictEqual(
      fixture.report(),
      ['block', 0, 0, 3, 4]
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
      ['row', 0, 0, 3, 4,
        ['block', 0, 3, 1, 4],
        ['block', 1, 0, 3, 4]
      ]
    )
  })

  // [large]
  it('places a column of two blocks', async () => {
    const fixture = new Col(
      new Block(1, 1),
      new Block(2, 4)
    )
    fixture.place(0, 0)
    assert.deepStrictEqual(
      fixture.report(),
      ['col', 0, 0, 2, 5,
        ['block', 0, 0, 1, 1],
        ['block', 0, 1, 2, 5]
      ]
    )
  })

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
      ['col', 0, 0, 14, 22,
        ['row', 0, 0, 4, 4,
          ['block', 0, 2, 1, 4],
          ['block', 1, 0, 4, 4]
        ],
        ['row', 0, 4, 14, 22,
          ['block', 0, 16, 5, 22],
          ['col', 5, 4, 14, 22,
            ['block', 5, 4, 12, 12],
            ['block', 5, 12, 14, 22]
          ]
        ]
      ]
    )
  })
  // [/large]
})
