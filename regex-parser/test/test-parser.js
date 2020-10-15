const assert = require('assert')

const parse = require('../parser')

describe('parses correctly', async () => {
  it('parses the empty string', () => {
    assert.deepEqual(parse(''), [])
  })

  it('parses a single literal', () => {
    assert.deepEqual(parse('a'), [
      {kind: 'Lit', loc: 0, value: 'a'}
    ])
  })

  it('parses multiple literals', () => {
    assert.deepEqual(parse('ab'), [
      {kind: 'Lit', loc: 0, value: 'a'},
      {kind: 'Lit', loc: 1, value: 'b'}
    ])
  })

  it('parses start anchors', () => {
    assert.deepEqual(parse('^a'), [
      {kind: 'Start', loc: 0},
      {kind: 'Lit', loc: 1, value: 'a'}
    ])
  })

  it('handles circumflex not at start', () => {
    assert.deepEqual(parse('a^'), [
      {kind: 'Lit', loc: 0, value: 'a'},
      {kind: 'Lit', loc: 1, value: '^'}
    ])
  })

  it('parses end anchors', () => {
    assert.deepEqual(parse('a$'), [
      {kind: 'Lit', loc: 0, value: 'a'},
      {kind: 'End', loc: 1}
    ])
  })

  it('parses circumflex not at start', () => {
    assert.deepEqual(parse('$a'), [
      {kind: 'Lit', loc: 0, value: '$'},
      {kind: 'Lit', loc: 1, value: 'a'}
    ])
  })

  it('parses empty groups', () => {
    assert.deepEqual(parse('()'), [
      {kind: 'Group', loc: 0, end: 1, children: []}
    ])
  })

  it('parses groups containing characters', () => {
    assert.deepEqual(parse('(a)'), [
      {kind: 'Group', loc: 0, end: 2, children: [
        {kind: 'Lit', loc: 1, value: 'a'}
      ]}
    ])
  })

  it('parses two groups containing characters', () => {
    assert.deepEqual(parse('(a)(b)'), [
      {kind: 'Group', loc: 0, end: 2, children: [
        {kind: 'Lit', loc: 1, value: 'a'}
      ]},
      {kind: 'Group', loc: 3, end: 5, children: [
        {kind: 'Lit', loc: 4, value: 'b'}
      ]}
    ])
  })

  it('parses any', () => {
    assert.deepEqual(parse('a*'), [
      {kind: 'Any', loc: 1, child:
       {kind: 'Lit', loc: 0, value: 'a'}
      }
    ])
  })

  it('parses any of group', () => {
    assert.deepEqual(parse('(ab)*'), [
      {kind: 'Any', loc: 4, child:
       {kind: 'Group', loc: 0, end: 3, children: [
         {kind: 'Lit', loc: 1, value: 'a'},
         {kind: 'Lit', loc: 2, value: 'b'}
       ]}
      }
    ])
  })

  it('parses alt', () => {
    assert.deepEqual(parse('a|b'), [
      {kind: 'Alt', loc: 1,
       left: {kind: 'Lit', loc: 0, value: 'a'},
       right: {kind: 'Lit', loc: 2, value: 'b'}
      }
    ])
  })

  it('parses alt of any', () => {
    assert.deepEqual(parse('a*|b'), [
      {kind: 'Alt', loc: 2,
       left: {kind: 'Any', loc: 1, child:
              {kind: 'Lit', loc: 0, value: 'a'}},
       right: {kind: 'Lit', loc: 3, value: 'b'}
      }
    ])
  })

  it('parses alt of groups', () => {
    assert.deepEqual(parse('a|(bc)'), [
      {kind: 'Alt', loc: 1,
       left: {kind: 'Lit', loc: 0, value: 'a'},
       right: {kind: 'Group', loc: 2, end: 5, children: [
         {kind: 'Lit', loc: 3, value: 'b'},
         {kind: 'Lit', loc: 4, value: 'c'}
       ]}
      }
    ])
  })
})
