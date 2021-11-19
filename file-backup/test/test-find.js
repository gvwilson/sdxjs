import assert from 'assert'

import findNew from '../check-existing-files.js'

describe('pre-existing hashes and actual filesystem', () => {
  it('finds no pre-existing files when none given or exist', async () => {
    const expected = {}
    const actual = await findNew('file-backup/test/bck-0-csv-0', [])
    assert.deepStrictEqual(expected, actual,
      'Expected no files')
  })

  it('finds some files when one is given and none exist', async () => {
    const check = [['somefile.txt', '9876fedc']]
    const expected = { '9876fedc': 'somefile.txt' }
    const actual = await findNew('file-backup/test/bck-0-csv-0', check)
    assert.deepStrictEqual(expected, actual,
      'Expected one file')
  })

  it('finds nothing needs backup when there is a match', async () => {
    const check = [['alpha.js', 'abcd1234']]
    const expected = {}
    const actual = await findNew('file-backup/test/bck-1-csv-1', check)
    assert.deepStrictEqual(expected, actual,
      'Expected no files')
  })

  it('finds something needs backup when there is a mismatch', async () => {
    const check = [['alpha.js', 'a1b2c3d4']]
    const expected = { a1b2c3d4: 'alpha.js' }
    const actual = await findNew('file-backup/test/bck-1-csv-1', check)
    assert.deepStrictEqual(expected, actual,
      'Expected one file')
  })

  it('finds mixed matches', async () => {
    const check = [
      ['matches.js', '3456cdef'],
      ['matches.txt', 'abcd1234'],
      ['mismatch.txt', '12345678']
    ]
    const expected = { 12345678: 'mismatch.txt' }
    const actual = await findNew('file-backup/test/bck-4-csv-2', check)
    assert.deepStrictEqual(expected, actual,
      'Expected one file')
  })
})
