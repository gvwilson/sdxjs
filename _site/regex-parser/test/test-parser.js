import assert from 'assert'

import parse from '../parser.js'

describe('parses correctly', async () => {
  it('parses the empty string', () => {
    assert.deepStrictEqual(parse(''), [])
  })

  it('parses a single literal', () => {
    assert.deepStrictEqual(parse('a'), [
      { kind: 'Lit', loc: 0, value: 'a' }
    ])
  })

  it('parses multiple literals', () => {
    assert.deepStrictEqual(parse('ab'), [
      { kind: 'Lit', loc: 0, value: 'a' },
      { kind: 'Lit', loc: 1, value: 'b' }
    ])
  })

  // [omit]
  it('parses start anchors', () => {
    assert.deepStrictEqual(parse('^a'), [
      { kind: 'Start', loc: 0 },
      { kind: 'Lit', loc: 1, value: 'a' }
    ])
  })

  it('handles circumflex not at start', () => {
    assert.deepStrictEqual(parse('a^'), [
      { kind: 'Lit', loc: 0, value: 'a' },
      { kind: 'Lit', loc: 1, value: '^' }
    ])
  })

  it('parses end anchors', () => {
    assert.deepStrictEqual(parse('a$'), [
      { kind: 'Lit', loc: 0, value: 'a' },
      { kind: 'End', loc: 1 }
    ])
  })

  it('parses circumflex not at start', () => {
    assert.deepStrictEqual(parse('$a'), [
      { kind: 'Lit', loc: 0, value: '$' },
      { kind: 'Lit', loc: 1, value: 'a' }
    ])
  })

  it('parses empty groups', () => {
    assert.deepStrictEqual(parse('()'), [
      { kind: 'Group', loc: 0, end: 1, children: [] }
    ])
  })

  it('parses groups containing characters', () => {
    assert.deepStrictEqual(parse('(a)'), [
      {
        kind: 'Group',
        loc: 0,
        end: 2,
        children: [
          { kind: 'Lit', loc: 1, value: 'a' }
        ]
      }
    ])
  })

  it('parses two groups containing characters', () => {
    assert.deepStrictEqual(parse('(a)(b)'), [
      {
        kind: 'Group',
        loc: 0,
        end: 2,
        children: [
          { kind: 'Lit', loc: 1, value: 'a' }
        ]
      },
      {
        kind: 'Group',
        loc: 3,
        end: 5,
        children: [
          { kind: 'Lit', loc: 4, value: 'b' }
        ]
      }
    ])
  })

  it('parses any', () => {
    assert.deepStrictEqual(parse('a*'), [
      {
        kind: 'Any',
        loc: 1,
        child: { kind: 'Lit', loc: 0, value: 'a' }
      }
    ])
  })

  it('parses any of group', () => {
    assert.deepStrictEqual(parse('(ab)*'), [
      {
        kind: 'Any',
        loc: 4,
        child: {
          kind: 'Group',
          loc: 0,
          end: 3,
          children: [
            { kind: 'Lit', loc: 1, value: 'a' },
            { kind: 'Lit', loc: 2, value: 'b' }
          ]
        }
      }
    ])
  })

  it('parses alt', () => {
    assert.deepStrictEqual(parse('a|b'), [
      {
        kind: 'Alt',
        loc: 1,
        left: { kind: 'Lit', loc: 0, value: 'a' },
        right: { kind: 'Lit', loc: 2, value: 'b' }
      }
    ])
  })

  it('parses alt of any', () => {
    assert.deepStrictEqual(parse('a*|b'), [
      {
        kind: 'Alt',
        loc: 2,
        left: {
          kind: 'Any',
          loc: 1,
          child: { kind: 'Lit', loc: 0, value: 'a' }
        },
        right: { kind: 'Lit', loc: 3, value: 'b' }
      }
    ])
  })
  // [/omit]

  it('parses alt of groups', () => {
    assert.deepStrictEqual(parse('a|(bc)'), [
      {
        kind: 'Alt',
        loc: 1,
        left: { kind: 'Lit', loc: 0, value: 'a' },
        right: {
          kind: 'Group',
          loc: 2,
          end: 5,
          children: [
            { kind: 'Lit', loc: 3, value: 'b' },
            { kind: 'Lit', loc: 4, value: 'c' }
          ]
        }
      }
    ])
  })
})
