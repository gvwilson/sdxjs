const assert = require('assert')
const fs = require('fs-extra-promise')
const glob = require('glob-promise')
const mock = require('mock-fs')
const crypto = require('crypto')

const backup = require('../backup')

const hashString = (data) => {
  const hasher = crypto.createHash('sha1').setEncoding('hex')
  hasher.write(data)
  hasher.end()
  return hasher.read()
}

const Contents = {
  aaa: 'AAA',
  bbb: 'BBB',
  ccc: 'CCC'
}

const Hashes = Object.keys(Contents).reduce((obj, key) => {
  obj[key] = hashString(Contents[key])
  return obj
}, {})

const Fixture = {
  'source': {
    'alpha.txt': Contents.aaa,
    'beta.txt': Contents.bbb,
    gamma: {
      'delta.txt': Contents.ccc
    }
  },
  'backup': {}
}

const InitialBackups = Object.keys(Hashes).reduce((set, filename) => {
  set.add(`backup/${Hashes[filename]}.bck`)
  return set
}, new Set())

describe('check entire backup process', () => {

  beforeEach(() => {
    mock(Fixture)
  })

  afterEach(() => {
    mock.restore()
  })

  it('creates an initial CSV manifest', async () => {
    await backup('source', 'backup', timestamp=0)

    assert.equal((await glob('backup/*')).length, 4,
                 `Expected 4 files`)

    const actualBackups = new Set(await glob('backup/*.bck'))
    assert.deepEqual(actualBackups, InitialBackups,
                     `Expected 3 backup files`)

    const actualManifests = await glob('backup/*.csv')
    assert.deepEqual(actualManifests, ['backup/0000000000.csv'],
                     `Expected one manifest`)
  })

  it('does not duplicate files unnecessarily', async () => {
    await backup('source', 'backup', timestamp=0)
    assert.equal((await glob('backup/*')).length, 4,
                 `Expected 4 files after first backup`)

    await backup('source', 'backup', timestamp=1)
    assert.equal((await glob('backup/*')).length, 5,
                 `Expected 5 files after second backup`)
    const actualBackups = new Set(await glob('backup/*.bck'))
    assert.deepEqual(actualBackups, InitialBackups,
                     `Expected 3 backup files after second backup`)

    const actualManifests = (await glob('backup/*.csv')).sort()
    assert.deepEqual(actualManifests, ['backup/0000000000.csv',
                                       'backup/0000000001.csv'],
                     `Expected two manifests`)
  })

  it('adds a file as needed', async () => {
    await backup('source', 'backup', timestamp=0)
    assert.equal((await glob('backup/*')).length, 4,
                 `Expected 4 files after first backup`)

    await fs.writeFileAsync('source/newfile.txt', 'NNN')
    const hashOfNewFile = hashString('NNN')

    await backup('source', 'backup', timestamp=1)
    assert.equal((await glob('backup/*')).length, 6,
                 `Expected 6 files after second backup`)
    const expected = new Set(InitialBackups).add(`backup/${hashOfNewFile}.bck`)
    const actualBackups = new Set(await glob('backup/*.bck'))
    assert.deepEqual(actualBackups, expected,
                     `Expected 4 backup files after second backup`)

    const actualManifests = (await glob('backup/*.csv')).sort()
    assert.deepEqual(actualManifests, ['backup/0000000000.csv',
                                       'backup/0000000001.csv'],
                     `Expected two manifests`)
  })
})
