import assert from 'assert'

import {
  WrappedBlock as Block,
  WrappedCol as Col,
  WrappedRow as Row
} from '../wrapped.js'

describe('wraps blocks', () => {
  it('wraps a single unit block', async () => {
    const fixture = new Block(1, 1)
    const wrapped = fixture.wrap()
    wrapped.place(0, 0)
    assert.deepStrictEqual(
      wrapped.report(),
      ['block', 0, 0, 1, 1]
    )
  })

  it('wraps a large block', async () => {
    const fixture = new Block(3, 4)
    const wrapped = fixture.wrap()
    wrapped.place(0, 0)
    assert.deepStrictEqual(
      wrapped.report(),
      ['block', 0, 0, 3, 4]
    )
  })

  it('wrap a row of two blocks that fit on one row', async () => {
    const fixture = new Row(
      100,
      new Block(1, 1),
      new Block(2, 4)
    )
    const wrapped = fixture.wrap()
    wrapped.place(0, 0)
    assert.deepStrictEqual(
      wrapped.report(),
      ['row', 0, 0, 3, 4,
        ['col', 0, 0, 3, 4,
          ['row', 0, 0, 3, 4,
            ['block', 0, 3, 1, 4],
            ['block', 1, 0, 3, 4]
          ]
        ]
      ]
    )
  })

  it('wraps a column of two blocks', async () => {
    const fixture = new Col(
      new Block(1, 1),
      new Block(2, 4)
    )
    const wrapped = fixture.wrap()
    wrapped.place(0, 0)
    assert.deepStrictEqual(
      wrapped.report(),
      ['col', 0, 0, 2, 5,
        ['block', 0, 0, 1, 1],
        ['block', 0, 1, 2, 5]
      ]
    )
  })

  it('wraps a grid of rows of columns that all fit on their row', async () => {
    const fixture = new Col(
      new Row(
        100,
        new Block(1, 2),
        new Block(3, 4)
      ),
      new Row(
        100,
        new Block(5, 6),
        new Col(
          new Block(7, 8),
          new Block(9, 10)
        )
      )
    )
    const wrapped = fixture.wrap()
    wrapped.place(0, 0)
    assert.deepStrictEqual(
      wrapped.report(),
      ['col', 0, 0, 14, 22,
        ['row', 0, 0, 4, 4,
          ['col', 0, 0, 4, 4,
            ['row', 0, 0, 4, 4,
              ['block', 0, 2, 1, 4],
              ['block', 1, 0, 4, 4]
            ]
          ]
        ],
        ['row', 0, 4, 14, 22,
          ['col', 0, 4, 14, 22,
            ['row', 0, 4, 14, 22,
              ['block', 0, 16, 5, 22],
              ['col', 5, 4, 14, 22,
                ['block', 5, 4, 12, 12],
                ['block', 5, 12, 14, 22]
              ]
            ]
          ]
        ]
      ]
    )
  })

  // [example]
  it('wrap a row of two blocks that do not fit on one row', async () => {
    const fixture = new Row(
      3,
      new Block(2, 1),
      new Block(2, 1)
    )
    const wrapped = fixture.wrap()
    wrapped.place(0, 0)
    assert.deepStrictEqual(
      wrapped.report(),
      ['row', 0, 0, 2, 2,
        ['col', 0, 0, 2, 2,
          ['row', 0, 0, 2, 1,
            ['block', 0, 0, 2, 1]
          ],
          ['row', 0, 1, 2, 2,
            ['block', 0, 1, 2, 2]
          ]
        ]
      ]
    )
  })
  // [/example]

  it('wrap multiple blocks that do not fit on one row', async () => {
    const fixture = new Row(
      3,
      new Block(2, 1),
      new Block(2, 1),
      new Block(1, 1),
      new Block(2, 1)
    )
    const wrapped = fixture.wrap()
    wrapped.place(0, 0)
    assert.deepStrictEqual(
      wrapped.report(),
      ['row', 0, 0, 3, 3,
        ['col', 0, 0, 3, 3,
          ['row', 0, 0, 2, 1,
            ['block', 0, 0, 2, 1]
          ],
          ['row', 0, 1, 3, 2,
            ['block', 0, 1, 2, 2],
            ['block', 2, 1, 3, 2]
          ],
          ['row', 0, 2, 2, 3,
            ['block', 0, 2, 2, 3]
          ]
        ]
      ]
    )
  })
})
