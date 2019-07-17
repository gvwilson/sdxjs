const assert = require('assert')

const need = require('../../module-loader/need-04')
const DataFrame = need(__filename, '../dataframe.js')

const ZeroRows = []
const OneRow = [{ones: 1, tens: 10}]
const OneRowBig = [{ones: 9, tens: 90}]
const TwoRows = [{ones: 1, tens: 10},
                 {ones: 2, tens: 20}]
const ThreeRows = [{ones: 1, tens: 10},
                   {ones: 2, tens: 20},
                   {ones: 3, tens: 30}]
const Colors = [
  {name: 'black', red: 0, green: 0, blue: 0},
  {name: 'red', red: 255, green: 0, blue: 0},
  {name: 'maroon', red: 128, green: 0, blue: 0},
  {name: 'lime', red: 0, green: 255, blue: 0},
  {name: 'green', red: 0, green: 128, blue: 0},
  {name: 'blue', red: 0, green: 0, blue: 255},
  {name: 'navy', red: 0, green: 0, blue: 128},
  {name: 'yellow', red: 255, green: 255, blue: 0},
  {name: 'fuchsia', red: 255, green: 0, blue: 255},
  {name: 'aqua', red: 0, green: 255, blue: 255},
  {name: 'white', red: 255, green: 255, blue: 255}
]

const GroupRedCountRed = new Map([[0, 6], [128, 1], [255, 4]])
const GroupRedMaxGreen = new Map([[0, 255], [128, 0], [255, 255]])
const GroupRedMaxRed = new Map([[0, 0], [128, 128], [255, 255]])

describe('dataframe construction', () => {
  it('will not create a dataframe from invalid values', async () => {
    assert.throws(() => new DataFrame(null),
                  Error,
                  `Should not be able to create dataframe from null`)
    assert.throws(() => new DataFrame('a,b,c'),
                  Error,
                  `Should not be able to create dataframe from string`)
    assert.throws(() => new DataFrame(new DataFrame([])),
                  Error,
                  `Should not be able to create dataframe from dataframe`)
  })

  it('can create an empty dataframe', async () => {
    const df = new DataFrame([])
    assert.equal(df.data.length, 0,
                 `Expected no rows`)
    assert.equal(df.columns.size, 0,
                 `Expected no columns`)
  })

  it('can create a dataframe with one row', async () => {
    const df = new DataFrame(OneRow)
    assert.deepEqual(df.data, OneRow,
                     `Wrong value(s) in row`)
    assert(df.hasColumns(['ones', 'tens']),
           `Wrong value(s) in column names`)
  })

  it('can create a dataframe with multiple rows', async () => {
    const df = new DataFrame(ThreeRows)
    assert.deepEqual(df.data, ThreeRows,
                     `Wrong value(s) in row`)
    assert(df.hasColumns(['ones', 'tens'], true),
           `Wrong value(s) in column names`)
  })

  it('complains about mis-matched column names', async () => {
    assert.throws(() => new DataFrame([{ones: 1}, {tens: 2}]),
                  Error,
                  `Expected error with mis-matched column names`)
    assert.throws(() => new DataFrame([{ones: 1, tens: 10},
                                       {tens: 10}]),
                  Error,
                  `Expected error with missing column names`)
  })

  it('creates an empty dataframe with pre-existing columns', async () => {
    const columns = new Set(['first', 'second'])
    const df = new DataFrame([], columns)
    assert.equal(df.data.length, 0,
                 `Should not be rows in empty dataframe`)
    assert.deepEqual(df.columns, columns,
                     `Wrong column name(s) in result`)
  })

  it('complains about illegal column names', async () => {
    assert.throws(() => new DataFrame([{'': 1}]),
                  Error,
                  `Expected error with empty column name`)
    assert.throws(() => new DataFrame([{'_underscore': 1}]),
                  Error,
                  `Expected error with leading underscore in column name`)
    assert.throws(() => new DataFrame([{'1one': 1}]),
                  Error,
                  `Expected error with leading digit in column name`)
    assert.throws(() => new DataFrame([{' a b ': 1}]),
                  Error,
                  `Expected error with spaces in column name`)
  })
})

describe('dataframe equality', () => {
  it('only checks dataframes', async () => {
    const df = new DataFrame(TwoRows)
    assert.throws(() => df.equal(new Date()),
                  Error,
                  `Must check against dataframes`)
  })

  it('thinks completely empty dataframes are equal', async () => {
    const left = new DataFrame([])
    const right = new DataFrame([])
    assert(left.equal(right),
           `Expected empty dataframes to be equal`)
  })

  it('thinks empty dataframes with matching columns are equal', async () => {
    const left = new DataFrame([], ['red', 'green'])
    const right = new DataFrame([], ['red', 'green'])
    assert(left.equal(right),
           `Expected empty with matching columns to be equal`)
  })

  it('thinks empty dataframes with mis-matched columns are equal', async () => {
    const left = new DataFrame([], ['red', 'green'])
    const right = new DataFrame([], ['red', 'blue'])
    assert(!left.equal(right),
           `Expected empty with mis-matched columns to be unequal`)
  })

  it('thinks dataframes with different columns are unequal', async () => {
    const left = new DataFrame([{first: 1}])
    const right = new DataFrame([{first: 1, second: 2}])
    assert(!left.equal(right),
           `Should think extra column makes dataframes unequal`)
    assert(!right.equal(left),
           `Should think extra column makes dataframes unequal`)
  })

  it('thinks frames with the same columns and rows are equal', async () => {
    const left = new DataFrame(ThreeRows)
    const right = new DataFrame(ThreeRows)
    assert(left.equal(right),
           `Expected equal frames to be equal`)
  })

  it('thinks frames with different numbers of rows are unequal', async () => {
    const left = new DataFrame([{first: 1}])
    const right = new DataFrame([{first: 1},
                                 {first: 1}])
    assert(!left.equal(right),
           `Expected extra rows to be unequal`)
    assert(!right.equal(left),
           `Expected extra rows to be unequal`)
  })

  it('thinks frames with reversed rows are equal', async () => {
    const left = new DataFrame(ThreeRows)
    const right = new DataFrame(ThreeRows.slice().reverse())
    assert(left.equal(right),
           `Expected frames to be equal despite reordering`)
  })

  it ('thinks frames with mis-matched values are unequal', async () => {
    const left = new DataFrame(ThreeRows)
    const right = new DataFrame(ThreeRows.slice())
    right.data[0] = {...right.data[0], ones: -1}
    assert(!left.equal(right),
           `Expected frames with unequal values to be unequal`)
  })

  it ('handles out-of-order columns', async () => {
    const left = new DataFrame([{ones: 1, tens: 10},
                                {tens: 20, ones: 2}])
    const right = new DataFrame([{ones: 1, tens: 10},
                                 {tens: 10, ones: 1}])
    assert(!left.equal(right),
           `Unequal values should be unequal`)
    assert(!right.equal(left),
           `Unequal values should be unequal`)
  })
})

describe('dataframe columns', () => {
  it('checks column subsets', async () => {
    const df = new DataFrame(TwoRows)
    assert(df.hasColumns(['ones']),
           `Expected to find some columns`)
    assert(df.hasColumns(['ones', 'tens']),
           `Expected to find all columns`)
  })

  it('fails when checking for missing columns', async () => {
    const df = new DataFrame(TwoRows)
    assert(!df.hasColumns(['nope']),
           `Should not find nonexistent column`)
  })

  it('fails when looking for a mix of columns', async () => {
    const df = new DataFrame(TwoRows)
    assert(!df.hasColumns(['ones', 'nope']),
           `Should fail to match mix of present and missing columns`)
  })
})

describe('basic dataframe operations', () => {
  it('drops columns, leaving columns', async () => {
    const df = new DataFrame(TwoRows)
    const result = df.drop(['ones'])
    assert(result.equal(new DataFrame([{tens: 10}, {tens: 20}])),
           `Wrong values survived dropping`)
  })

  it('drops all columns', async () => {
    const df = new DataFrame(TwoRows)
    const result = df.drop(['ones', 'tens'])
    assert.equal(result.data.length, 0,
                 `Nothing should survive dropping all columns`)
    assert(result.hasColumns([], true),
           `No columns should survive dropping all columns`)
  })

  it('drops no columns', async () => {
    const df = new DataFrame(TwoRows)
    const result = df.drop([])
    assert.deepEqual(result.data, TwoRows,
                     `All rows should survive dropping no columns`)
    assert(result.hasColumns(['ones', 'tens'], true),
           `All columns should survive dropping no columns`)
  })

  it('selects columns, leaving columns', async () => {
    const df = new DataFrame(TwoRows)
    const result = df.select(['ones'])
    assert(result.equal(new DataFrame([{ones: 1}, {ones: 2}])),
           `Wrong values survived selecting`)
  })

  it('selects all columns', async () => {
    const df = new DataFrame(TwoRows)
    const result = df.select(['tens', 'ones'])
    assert(result.equal(new DataFrame(TwoRows.slice())),
           `Something failed to survive selecting all`)
    assert(result.hasColumns(['tens', 'ones'], true),
           `Wrong columns survived selecting all`)
  })

  it('checks column names when dropping', async () => {
    const df = new DataFrame(TwoRows)
    assert.throws(() => df.drop(['nope']),
                  Error,
                  `Expected error when dropping non-existent column`)
  })

  it('checks column names when selecting', async () => {
    const df = new DataFrame(TwoRows)
    assert.throws(() => df.select(['nope']),
                  Error,
                  `Expected error when selecting non-existent column`)
  })

  it('keeps all rows', async () => {
    const expr = (row, i) => true
    const df = new DataFrame(TwoRows)
    const result = df.filter(expr)
    assert(result.equal(new DataFrame(TwoRows.slice())),
           `Should keep all rows when keeping all rows`)
  })

  it('discards all rows', async () => {
    const expr = (row, i) => false
    const df = new DataFrame(TwoRows)
    const result = df.filter(expr)
    assert(result.equal(new DataFrame([], ['ones', 'tens'])),
           `Should have no rows when discarding all`)
  })

  it('discards some rows', async () => {
    const expr = (row, i) => row.tens <= 20
    const df = new DataFrame(ThreeRows)
    const result = df.filter(expr)
    assert(result.equal(new DataFrame(TwoRows.slice())),
           `Should have two rows when filtering some`)
    assert(result.hasColumns(['ones', 'tens'], true),
           `Should not change columns when filtering some`)
  })

  it('requires a new column name when mutating', async () => {
    const df = new DataFrame(TwoRows)
    const expr = (row, i) => 99
    assert.throws(() => df.mutate('', expr),
                  Error,
                  `Expected error with empty new column name`)
  })

  it('only allows legal column names when mutating', async () => {
    const df = new DataFrame(TwoRows)
    const expr = (row, i) => 99
    assert.throws(() => df.mutate(' with spaces ', expr),
                  Error,
                  `Expected error with illegal column name`)
  })

  it('mutates an empty dataframe', async () => {
    const df = new DataFrame([])
    const expr = (row, i) => 99
    const result = df.mutate('col', expr)
    assert.deepEqual(result.data, [],
                     `Expected empty dataframe`)
  })

  it('creates an entirely new column', async () => {
    const df = new DataFrame(TwoRows)
    const expr = (row, i) => 99
    const result = df.mutate('col', expr)
    assert(result.equal(new DataFrame([{ones: 1, tens: 10, col: 99},
                                       {ones: 2, tens: 20, col: 99}])),
           `Wrong result for mutate`)
  })

  it('replaces an existing column', async () => {
    const df = new DataFrame(TwoRows)
    const expr = (row, i) => 99
    const result = df.mutate('ones', expr)
    assert(result.equal(new DataFrame([{ones: 99, tens: 10},
                                       {ones: 99, tens: 20}])),
           `Wrong result for mutate`)
  })

  it('requires a sorting column name', async () => {
    const df = new DataFrame(TwoRows)
    assert.throws(() => df.sort([]),
                  Error,
                  `Expected error when sorting without column names`)
  })

  it('requires known column names', async () => {
    const df = new DataFrame(TwoRows)
    assert.throws(() => df.sort(['nope']),
                  Error,
                  `Expected error when sorting with missing column names`)
  })

  it('sorts an empty dataframe', async () => {
    const df = new DataFrame([], ['ones'])
    const result = df.sort(['ones'])
    assert.deepEqual(result.data, [],
                     `Expected empty dataframe`)
  })

  it('sorts by a single key', async () => {
    const data = TwoRows.slice().reverse()
    const df = new DataFrame(data)
    const result = df.sort(['ones'])
    assert.deepEqual(result.data, TwoRows,
                     `Wrong result for sorting with a single key`)
  })

  it('sorts by a single key in reverse order', async () => {
    const df = new DataFrame(TwoRows)
    const result = df.sort(['ones'], true)
    const expected = TwoRows.slice().reverse()
    assert.deepEqual(result.data, expected,
                     `Wrong result for sorting in reverse`)
  })

  it('sorts by multiple keys', async () => {
    const input = [{first: 'a', second: 'Q'},
                   {first: 'b', second: 'R'},
                   {first: 'b', second: 'Q'},
                   {first: 'a', second: 'R'}]
    const df = new DataFrame(input)
    const result = df.sort(['second', 'first'])
    const expected = [{first: 'a', second: 'Q'},
                      {first: 'b', second: 'Q'},
                      {first: 'a', second: 'R'},
                      {first: 'b', second: 'R'}]
    assert.deepEqual(result.data, expected,
                     `Wrong result for sorting with two keys`)
  })

  it('sorts with missing data', async () => {
    const input = [{first: 'a', second: 'Q'},
                   {first: DataFrame.MISSING, second: 'Q'},
                   {first: 'a', second: DataFrame.MISSING},
                   {first: DataFrame.MISSING, second: DataFrame.MISSING}]
    const df = new DataFrame(input)
    const result = df.sort(['first', 'second'])
    const expected = [
      { first: DataFrame.MISSING, second: DataFrame.MISSING },
      { first: DataFrame.MISSING, second: 'Q' },
      { first: 'a', second: DataFrame.MISSING },
      { first: 'a', second: 'Q' }
    ]
    assert.deepEqual(result.data, expected,
                     `Wrong result for sorting with missing data`)
  })

  it('requires column names for uniqueness test', async () => {
    const df = new DataFrame(TwoRows)
    assert.throws(() => df.unique([]),
                  Error,
                  `Expected error when no column names provided`)
  })

  it('requires existing column names for uniqueness test', async () => {
    const df = new DataFrame(TwoRows)
    assert.throws(() => df.unique(['nope']),
                  Error,
                  `Expected error when nonexistent column names provided`)
  })

  it('handles empty dataframes', async () => {
    const df = new DataFrame([], ['ones'])
    const result = df.unique(['ones'])
    assert.deepEqual(result.data, [],
                     `Expected empty dataframe`)
  })

  it('keeps all rows when all rows are unique', async () => {
    const df = new DataFrame(TwoRows)
    const result = df.unique(['ones'])
    assert(result.equal(new DataFrame(TwoRows.slice())),
           `Expected all rows to be kept`)
  })

  it('discards rows when there are duplicates', async () => {
    const data = TwoRows.concat(TwoRows)
    const df = new DataFrame(data)
    const result = df.unique(['ones'])
    assert(result.equal(new DataFrame(TwoRows.slice())),
           `Expected duplicates to be removed`)
  })

  it('handles multiple keys', async () => {
    const original = [{ones: 1, tens: 10, hundreds: 100},
                      {ones: 1, tens: 10, hundreds: 200},
                      {ones: 2, tens: 10, hundreds: 100}]
    const df = new DataFrame(original)
    const result = df.unique(['ones', 'tens'])
    assert.equal(result.data.length, 2,
                 `Wrong number of rows survived`)
  })
})

describe('dataframe groupby and summarize', () => {

  it('refuses to group with illegal parameters', async () => {
    const df = new DataFrame(TwoRows)
    assert.throws(() => df.groupBy([]),
                  Error,
                  'should not be able to group by no columns')
    assert.throws(() => df.groupBy(['nope']),
                  Error,
                  'should not be able to group by nonexistent column')
    assert.throws(() => df.groupBy(['ones', 'ones']),
                  Error,
                  'should not be able to group by duplicate columns')
  })

  it('creates one group for each row when values are unique', async () => {
    const df = new DataFrame(TwoRows)
    const result = df.groupBy(['ones'])
    assert(result.equal(new DataFrame([{ones: 1, tens: 10, '_group_': 1},
                                       {ones: 2, tens: 20, '_group_': 2}])),
           `Wrong group column values`)
  })

  it('creates one group when all rows have the same value', async () => {
    const original = [{ones: 1, tens: 10},
                      {ones: 1, tens: 20}]
    const df = new DataFrame(original)
    const result = df.groupBy(['ones'])
    assert(result.equal(new DataFrame([{ones: 1, tens: 10, '_group_': 1},
                                       {ones: 1, tens: 20, '_group_': 1}])),
           `Wrong group column values`)
  })

  it('creates multiple groups when rows have a mix of values', async () => {
    const original = [{ones: 1, tens: 10},
                      {ones: 2, tens: 20},
                      {ones: 1, tens: 30}]
    const df = new DataFrame(original)
    const result = df.groupBy(['ones'])
    assert(result.equal(new DataFrame([{ones: 1, tens: 10, '_group_': 1},
                                       {ones: 2, tens: 20, '_group_': 2},
                                       {ones: 1, tens: 30, '_group_': 1}])),
           `Wrong group column values`)
  })

  it('groups by multiple values', async () => {
    const original = [{ones: 1, tens: 10},
                      {ones: 2, tens: 20},
                      {ones: 1, tens: 30}]
    const df = new DataFrame(original)
    const result = df.groupBy(['ones', 'tens'])
    assert(result.equal(new DataFrame([{ones: 1, tens: 10, '_group_': 1},
                                       {ones: 2, tens: 20, '_group_': 2},
                                       {ones: 1, tens: 30, '_group_': 3}])),
            `Wrong group column values`)
  })

  it('refuses to ungroup data that is not grouped', async () => {
    const df = new DataFrame(ThreeRows)
    assert.throws(()=> df.ungroup(),
                  Error,
                  `Should not be able to ungroup data that is not grouped`)
  })

  it('removes the grouping column from grouped data', async () => {
    const data = ThreeRows.map(row => ({...row}))
    data.forEach(row => {
      row[DataFrame.GROUPCOL] = 1
    })
    const df = new DataFrame(data, null)
    const result = df.ungroup()
    assert(result.data.every(row => !(DataFrame.GROUPCOL in row)),
           `Group column should not be in data`)
    assert(!result.hasColumns([DataFrame.GROUPCOL]),
           `Expected grouping column to be removed`)
  })

  it('requires arguments for summarization', async () => {
    const df = new DataFrame(TwoRows)
    assert.throws(() => df.summarize(null, 'ones'),
                  Error,
                 `Require a summarizer`)
    assert.throws(() => df.summarize(new Date(), 'ones'),
                  Error,
                 `Require a summarizer`)
    assert.throws(() => df.summarize(DataFrame.Count, ''),
                  Error,
                  `Expected error with empty column name`)
    assert.throws(() => df.summarize(DataFrame.Count, 'nope'),
                  Error,
                  `Expected error with nonexistent column name`)
  })

  it('can summarize a single ungrouped column', async () => {
    const df = new DataFrame(TwoRows)
    const result = df.summarize(DataFrame.Count, 'ones')
    assert(result.equal(new DataFrame([{ones: 1, tens: 10,
                                        ones_count: 2},
                                       {ones: 2, tens: 20,
                                        ones_count: 2}])),
           `Wrong result`)
  })

  it('can summarize multiple ungrouped columns', async () => {
    const df = new DataFrame(TwoRows)
    const result = df
          .summarize(DataFrame.Count, 'ones')
          .summarize(DataFrame.Maximum, 'tens')
    assert(result.equal(new DataFrame([{ones: 1, tens: 10,
                                        ones_count: 2, tens_maximum: 20},
                                       {ones: 2, tens: 20,
                                        ones_count: 2, tens_maximum: 20}])),
           `Wrong result`)
  })

  it('can summarize the same ungrouped column multiple times', async () => {
    const df = new DataFrame(TwoRows)
    const result = df
          .summarize(DataFrame.Minimum, 'tens')
          .summarize(DataFrame.Maximum, 'tens')
    assert(result.equal(new DataFrame([{ones: 1, tens: 10,
                                        tens_minimum: 10, tens_maximum: 20},
                                       {ones: 2, tens: 20,
                                        tens_minimum: 10, tens_maximum: 20}])),
           `Wrong result`)
  })

  it('can summarize a single grouped column', async () => {
    const df = new DataFrame(Colors).groupBy(['red'])
    const result = df.summarize(DataFrame.Count, 'red')
    assert(
      result.data.every(row => (row.red_count === GroupRedCountRed.get(row.red))),
      `Wrong count(s) for grouped values`)
  })

  it('can summarize multiple grouped columns', async () => {
    const df = new DataFrame(Colors).groupBy(['red'])
    const result = df
          .summarize(DataFrame.Count, 'red')
          .summarize(DataFrame.Maximum, 'green')
    assert(
      result.data.every(row => (row.red_count === GroupRedCountRed.get(row.red))),
      `Wrong count(s) for grouped values`)
    assert(
      result.data.every(row => (row.green_maximum === GroupRedMaxGreen.get(row.red))),
      `Wrong maximum(s) for grouped values`)
  })

  it('can summarize the same grouped column multiple times', async () => {
    const df = new DataFrame(Colors).groupBy(['red'])
    const result = df
          .summarize(DataFrame.Count, 'red')
          .summarize(DataFrame.Maximum, 'red')
    assert(
      result.data.every(row => (row.red_count === GroupRedCountRed.get(row.red))),
      `Wrong count(s) for grouped values`)
    assert(
      result.data.every(row => (row.red_maximum === GroupRedMaxRed.get(row.red))),
      `Wrong maximum(s) for grouped values`)
  })
})

describe('dataframe join', () => {
  it('requires a valid name for the left table', async () => {
    const left = new DataFrame(OneRow)
    const right = new DataFrame(TwoRows)
    assert.throws(() => left.join('1number', 'ones', right, 'right', 'ones'),
                  Error,
                  `Should not be able to use invalid left table name`)
  })

  it('requires a valid name for the left column', async () => {
    const left = new DataFrame(OneRow)
    const right = new DataFrame(TwoRows)
    assert.throws(() => left.join('left', 'nope', right, 'right', 'ones'),
                  Error,
                  `Should not be able to use missing left column name`)
  })

  it('requires a valid dataframe for the right table', async () => {
    const left = new DataFrame(OneRow)
    const right = new Date()
    assert.throws(() => left.join('left', 'ones', right, 'right', 'ones'),
                  Error,
                  `Should not be able to join with non-table`)
  })

  it('requires a valid name for the right table', async () => {
    const left = new DataFrame(OneRow)
    const right = new DataFrame(TwoRows)
    assert.throws(() => left.join('left', 'ones', right, '[!3', 'ones'),
                  Error,
                  `Should not be able to use invalid right table name`)
  })

  it('requires a valid name for the right column', async () => {
    const left = new DataFrame(OneRow)
    const right = new DataFrame(TwoRows)
    assert.throws(() => left.join('left', 'ones', right, 'right', '   '),
                  Error,
                  `Should not be able to us invalid right column name`)
  })

  it('handles an empty table on the left', async () => {
    const left = new DataFrame(ZeroRows, ['ones', 'tens'])
    const right = new DataFrame(OneRow)
    const result = left.join('left', 'ones', right, 'right', 'ones')
    assert.deepEqual(result.data, [],
                     `Expected empty data`)
    const expectedColumns = new Set([DataFrame.JOINCOL, 'left_tens', 'right_tens'])
    assert.deepEqual(result.columns, expectedColumns,
                     `Expected to retain columns`)
  })

  it('handles an empty table on the right', async () => {
    const left = new DataFrame(OneRow)
    const right = new DataFrame(ZeroRows, ['ones', 'tens'])
    const result = left.join('left', 'ones', right, 'right', 'ones')
    assert.deepEqual(result.data, [],
                     `Expected empty data`)
    const expectedColumns = new Set([DataFrame.JOINCOL, 'left_tens', 'right_tens'])
    assert.deepEqual(result.columns, expectedColumns,
                     `Expected to retain columns`)
  })

  it('produces an empty table when there is no overlap', async () => {
    const left = new DataFrame(OneRow)
    const right = new DataFrame(OneRowBig)
    const result = left.join('left', 'tens', right, 'right', 'tens')
    assert.deepEqual(result.data, [],
                     `Expected empty data`)
    const expectedColumns = new Set([DataFrame.JOINCOL, 'right_ones', 'left_ones'])
    assert.deepEqual(result.columns, expectedColumns,
                     `Expected to retain columns`)
  })

  it('produces single joined rows', async () => {
    const left = new DataFrame(OneRow)
    const right = new DataFrame(ThreeRows)
    const result = left.join('left', 'ones', right, 'right', 'ones')
    assert(result.equal(new DataFrame([{_join_: 1, left_tens: 10, right_tens: 10}])),
           `Wrong resulting data`)
  })

  it('produces multiple joined rows', async () => {
    const left = new DataFrame(TwoRows)
    const right = new DataFrame(TwoRows)
    const result = left.join('left', 'tens', right, 'right', 'tens')
    const expected = [
      {_join_: 10, left_ones: 1, right_ones: 1},
      {_join_: 20, left_ones: 2, right_ones: 2}
    ]
    assert(result.equal(new DataFrame(expected)),
           `Wrong resulting data`)
  })

  it('does many-to-many matches', async () => {
    const left = new DataFrame(TwoRows)
    const right = new DataFrame([
      {ones: 1, hundreds: 100},
      {ones: 1, hundreds: 200},
      {ones: 1, hundreds: 300},
      {ones: 2, hundreds: 400},
      {ones: 2, hundreds: 500}
    ])
    const result = left.join('left', 'ones', right, 'right', 'ones')
    const expected = [
      {_join_: 1, left_tens: 10, right_hundreds: 100},
      {_join_: 1, left_tens: 10, right_hundreds: 200},
      {_join_: 1, left_tens: 10, right_hundreds: 300},
      {_join_: 2, left_tens: 20, right_hundreds: 400},
      {_join_: 2, left_tens: 20, right_hundreds: 500}
    ]
    assert(result.equal(new DataFrame(expected)),
           `Wrong resulting data`)
  })
})
