const assert = require('assert')

const tokenize = require('../tokenizer')

describe('tokenizes correctly', async () => {
  it('tokenizes a single character', () => {
    assert.deepEqual(tokenize('a'), [{kind: 'Lit', value: 'a', loc: 0}])
  })

  it('tokenizes a sequence of characters', () => {
    assert.deepEqual(tokenize('ab'), [{kind: 'Lit', value: 'a', loc: 0},
                                      {kind: 'Lit', value: 'b', loc: 1}])
  })

  it('tokenizes start anchor alone', () => {
    assert.deepEqual(tokenize('^'), [{kind: 'Start', loc: 0}])
  })

  it('tokenizes start anchor followed by characters', () => {
    assert.deepEqual(tokenize('^a'), [{kind: 'Start', loc: 0},
                                      {kind: 'Lit', value: 'a', loc: 1}])
  })

  it('tokenizes circumflex not at start', () => {
    assert.deepEqual(tokenize('a^b'), [{kind: 'Lit', value: 'a', loc: 0},
                                       {kind: 'Lit', value: '^', loc: 1},
                                       {kind: 'Lit', value: 'b', loc: 2}])
  })

  it('tokenizes start anchor alone', () => {
    assert.deepEqual(tokenize('$'), [{kind: 'End', loc: 0}])
  })

  it('tokenizes end anchor preceded by characters', () => {
    assert.deepEqual(tokenize('a$'), [{kind: 'Lit', value: 'a', loc: 0},
                                      {kind: 'End', loc: 1}])
  })

  it('tokenizes dollar sign not at end', () => {
    assert.deepEqual(tokenize('a$b'), [{kind: 'Lit', value: 'a', loc: 0},
                                       {kind: 'Lit', value: '$', loc: 1},
                                       {kind: 'Lit', value: 'b', loc: 2}])
  })

  it('tokenizes repetition alone', () => {
    assert.deepEqual(tokenize('*'), [{kind: 'Any', loc: 0}])
  })

  it('tokenizes repetition in string', () => {
    assert.deepEqual(tokenize('a*b'), [{kind: 'Lit', value: 'a', loc: 0},
                                       {kind: 'Any', loc: 1},
                                       {kind: 'Lit', value: 'b', loc: 2}])
  })

  it('tokenizes repetition at end of string', () => {
    assert.deepEqual(tokenize('a*'), [{kind: 'Lit', value: 'a', loc: 0},
                                      {kind: 'Any', loc: 1}])
  })

  it('tokenizes alternation alone', () => {
    assert.deepEqual(tokenize('|'), [{kind: 'Alt', loc: 0}])
  })

  it('tokenizes alternation in string', () => {
    assert.deepEqual(tokenize('a|b'), [{kind: 'Lit', value: 'a', loc: 0},
                                       {kind: 'Alt', loc: 1},
                                       {kind: 'Lit', value: 'b', loc: 2}])
  })

  it('tokenizes alternation at start of string', () => {
    assert.deepEqual(tokenize('|a'), [{kind: 'Alt', loc: 0},
                                      {kind: 'Lit', value: 'a', loc: 1}])
  })

  it('tokenizes the start of a group alone', () => {
    assert.deepEqual(tokenize('('), [{kind: 'GroupStart', loc: 0}])
  })

  it('tokenizes the start of a group in a string', () => {
    assert.deepEqual(tokenize('a(b'), [{kind: 'Lit', value: 'a', loc: 0},
                                       {kind: 'GroupStart', loc: 1},
                                       {kind: 'Lit', value: 'b', loc: 2}])
  })

  it('tokenizes the end of a group alone', () => {
    assert.deepEqual(tokenize(')'), [{kind: 'GroupEnd', loc: 0}])
  })

  it('tokenizes the end of a group at the end of a string', () => {
    assert.deepEqual(tokenize('a)'), [{kind: 'Lit', value: 'a', loc: 0},
                                      {kind: 'GroupEnd', loc: 1}])
  })

  it ('tokenizes a complex expression', () => {
    assert.deepEqual(tokenize('^a*(bcd|e^)*f$gh$'), [
      {kind: 'Start', loc: 0},
      {kind: 'Lit', loc: 1, value: 'a'},
      {kind: 'Any', loc: 2},
      {kind: 'GroupStart', loc: 3},
      {kind: 'Lit', loc: 4, value: 'b'},
      {kind: 'Lit', loc: 5, value: 'c'},
      {kind: 'Lit', loc: 6, value: 'd'},
      {kind: 'Alt', loc: 7},
      {kind: 'Lit', loc: 8, value: 'e'},
      {kind: 'Lit', loc: 9, value: '^'},
      {kind: 'GroupEnd', loc: 10},
      {kind: 'Any', loc: 11},
      {kind: 'Lit', loc: 12, value: 'f'},
      {kind: 'Lit', loc: 13, value: '$'},
      {kind: 'Lit', loc: 14, value: 'g'},
      {kind: 'Lit', loc: 15, value: 'h'},
      {kind: 'End', loc: 16}
    ])
  })
})
