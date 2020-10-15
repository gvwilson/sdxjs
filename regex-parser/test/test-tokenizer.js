const assert = require('assert')

const tokenize = require('../tokenizer')

describe('tokenizes correctly', async () => {
  it('tokenizes a single character', () => {
    assert.deepEqual(tokenize('a'), [{token: 'Lit', value: 'a', loc: 0}])
  })

  it('tokenizes a sequence of characters', () => {
    assert.deepEqual(tokenize('abc'), [{token: 'Lit', value: 'abc', loc: 0}])
  })

  it('tokenizes start anchor alone', () => {
    assert.deepEqual(tokenize('^'), [{token: 'Start', loc: 0}])
  })

  it('tokenizes start anchor followed by characters', () => {
    assert.deepEqual(tokenize('^abc'), [{token: 'Start', loc: 0},
                                        {token: 'Lit', value: 'abc', loc: 1}])
  })

  it('tokenizes circumflex not at start', () => {
    assert.deepEqual(tokenize('a^b'), [{token: 'Lit', value: 'a^b', loc: 0}])
  })

  it('tokenizes start anchor alone', () => {
    assert.deepEqual(tokenize('$'), [{token: 'End', loc: 0}])
  })

  it('tokenizes end anchor preceded by characters', () => {
    assert.deepEqual(tokenize('abc$'), [{token: 'Lit', value: 'abc', loc: 0},
                                        {token: 'End', loc: 3}])
  })

  it('tokenizes dollar sign not at end', () => {
    assert.deepEqual(tokenize('a$b'), [{token: 'Lit', value: 'a$b', loc: 0}])
  })

  it('tokenizes repetition alone', () => {
    assert.deepEqual(tokenize('*'), [{token: 'Any', loc: 0}])
  })

  it('tokenizes repetition in string', () => {
    assert.deepEqual(tokenize('a*b'), [{token: 'Lit', value: 'a', loc: 0},
                                       {token: 'Any', loc: 1},
                                       {token: 'Lit', value: 'b', loc: 2}])
  })

  it('tokenizes repetition at end of string', () => {
    assert.deepEqual(tokenize('a*'), [{token: 'Lit', value: 'a', loc: 0},
                                      {token: 'Any', loc: 1}])
  })

  it('tokenizes alternation alone', () => {
    assert.deepEqual(tokenize('|'), [{token: 'Alt', loc: 0}])
  })

  it('tokenizes alternation in string', () => {
    assert.deepEqual(tokenize('a|b'), [{token: 'Lit', value: 'a', loc: 0},
                                       {token: 'Alt', loc: 1},
                                       {token: 'Lit', value: 'b', loc: 2}])
  })

  it('tokenizes alternation at start of string', () => {
    assert.deepEqual(tokenize('|a'), [{token: 'Alt', loc: 0},
                                      {token: 'Lit', value: 'a', loc: 1}])
  })

  it('tokenizes the start of a group alone', () => {
    assert.deepEqual(tokenize('('), [{token: 'GroupStart', loc: 0}])
  })

  it('tokenizes the start of a group in a string', () => {
    assert.deepEqual(tokenize('a(b'), [{token: 'Lit', value: 'a', loc: 0},
                                       {token: 'GroupStart', loc: 1},
                                       {token: 'Lit', value: 'b', loc: 2}])
  })

  it('tokenizes the end of a group alone', () => {
    assert.deepEqual(tokenize(')'), [{token: 'GroupEnd', loc: 0}])
  })

  it('tokenizes the end of a group at the end of a string', () => {
    assert.deepEqual(tokenize('ab)'), [{token: 'Lit', value: 'ab', loc: 0},
                                       {token: 'GroupEnd', loc: 2}])
  })

  it ('tokenizes a complex expression', () => {
    assert.deepEqual(tokenize('^a*(bcd|e^)*f$gh$'), [
      {token: 'Start', loc: 0},
      {token: 'Lit', value: 'a', loc: 1},
      {token: 'Any', loc: 2},
      {token: 'GroupStart', loc: 3},
      {token: 'Lit', value: 'bcd', loc: 4},
      {token: 'Alt', loc: 7},
      {token: 'Lit', value: 'e^', loc: 8},
      {token: 'GroupEnd', loc: 10},
      {token: 'Any', loc: 11},
      {token: 'Lit', value: 'f$gh', loc: 12},
      {token: 'End', loc: 16}
    ])
  })
})
