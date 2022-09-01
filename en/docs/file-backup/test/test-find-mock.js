import assert from 'assert'
import mock from 'mock-fs'

import findNew from '../check-existing-files.js'

describe('checks for pre-existing hashes using mock filesystem', () => {
  beforeEach(() => {
    mock({
      'bck-0-csv-0': {},
      'bck-1-csv-1': {
        '0001.csv': 'alpha.js,abcd1234',
        'abcd1234.bck': 'alpha.js content'
      },
      'bck-4-csv-2': {
        '0001.csv': ['alpha.js,abcd1234',
          'beta.txt,bcde2345'].join('\n'),
        '3024.csv': ['alpha.js,abcd1234',
          'gamma.png,3456cdef',
          'subdir/renamed.txt,bcde2345'].join('\n'),
        '3456cdef.bck': 'gamma.png content',
        'abcd1234.bck': 'alpha content',
        'bcde2345.bck': 'beta.txt became subdir/renamed.txt'
      }
    })
  })

  afterEach(() => {
    mock.restore()
  })

  // [tests]
  it('finds no pre-existing files when none given or exist', async () => {
    const expected = {}
    const actual = await findNew('bck-0-csv-0', [])
    assert.deepStrictEqual(expected, actual,
      'Expected no files')
  })

  it('finds some files when one file is given and none exist', async () => {
    const candidates = [['somefile.txt', '9876fedc']]
    const expected = { '9876fedc': 'somefile.txt' }
    const actual = await findNew('bck-0-csv-0', candidates)
    assert.deepStrictEqual(expected, actual,
      'Expected one file')
  })

  it('finds nothing needs backup when there is a match', async () => {
    const candidates = [['alpha.js', 'abcd1234']]
    const expected = {}
    const actual = await findNew('bck-1-csv-1', candidates)
    assert.deepStrictEqual(expected, actual,
      'Expected no files')
  })

  it('finds something needs backup when there is a mismatch', async () => {
    const candidates = [['alpha.js', 'a1b2c3d4']]
    const expected = { a1b2c3d4: 'alpha.js' }
    const actual = await findNew('bck-1-csv-1', candidates)
    assert.deepStrictEqual(expected, actual,
      'Expected one file')
  })

  it('finds mixed matches', async () => {
    const candidates = [['matches.js', '3456cdef'],
      ['matches.txt', 'abcd1234'],
      ['mismatch.txt', '12345678']]
    const expected = { 12345678: 'mismatch.txt' }
    const actual = await findNew('bck-4-csv-2', candidates)
    assert.deepStrictEqual(expected, actual,
      'Expected one file')
  })
  // [/tests]
})
