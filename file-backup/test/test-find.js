const assert = require('assert')

const findNewFiles = require('../check-existing-files')

describe('checks for pre-existing hashes using actual filesystem', () => {
  it('finds no pre-existing files when none given and none exist', async () => {
    const expected = {}
    const actual = await findNewFiles('file-backup/test/bck-0-csv-0', [])
    assert.deepEqual(expected, actual,
                     `Expected no files`)
  })

  it('finds some files when one file is given and none exist', async () => {
    const candidates = [['somefile.txt', '9876fedc']]
    const expected = {'9876fedc': 'somefile.txt'}
    const actual = await findNewFiles('file-backup/test/bck-0-csv-0', candidates)
    assert.deepEqual(expected, actual,
                     `Expected one file`)
  })

  it('finds nothing needs backup when there is a match', async () => {
    const candidates = [['alpha.js', 'abcd1234']]
    const expected = {}
    const actual = await findNewFiles('file-backup/test/bck-1-csv-1', candidates)
    assert.deepEqual(expected, actual,
                     `Expected no files`)
  })

  it('finds something needs backup when there is a mismatch', async () => {
    const candidates = [['alpha.js', 'a1b2c3d4']]
    const expected = {'a1b2c3d4': 'alpha.js'}
    const actual = await findNewFiles('file-backup/test/bck-1-csv-1', candidates)
    assert.deepEqual(expected, actual,
                     `Expected one file`)
  })

  it('finds mixed matches', async () => {
    const candidates = [['matches.js', '3456cdef'],
                        ['matches.txt', 'abcd1234'],
                        ['mismatch.txt', '12345678']]
    const expected = {'12345678': 'mismatch.txt'}
    const actual = await findNewFiles('file-backup/test/bck-4-csv-2', candidates)
    assert.deepEqual(expected, actual,
                     `Expected one file`)
  })
})
