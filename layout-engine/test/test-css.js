const assert = require('assert')

const { TagNode } = require('../dom')
const {
  IdRule,
  ClassRule,
  TagRule,
  CssRules
} = require('../css')

describe('manages style rules', () => {
  it('converts empty JSON to empty rules', async () => {
    const allRules = new CssRules({})
    assert.strictEqual(allRules.rules.length,
      Object.keys(CssRules.DEFAULT_RULES).length,
      'Should not have any rules')
  })

  it('converts a mixture of rules', async () => {
    const allRules = new CssRules({
      '.cls': { width: 20 },
      '#top': { color: '#0000ff' },
      body: { 'font-weight': 'bold' }
    })
    const expected = new Set([
      new ClassRule('.cls', { width: 20 }),
      new IdRule('#top', { color: '#0000ff' }),
      new TagRule('body', {
        'font-weight': 'bold',
        visible: true,
        layout: 'vertical'
      }),
      new TagRule('row', {
        visible: true,
        layout: 'horizontal'
      }),
      new TagRule('col', {
        visible: true,
        layout: 'vertical'
      }),
      new TagRule('p', {
        visible: true,
        layout: 'wrap'
      })
    ])
    assert.deepStrictEqual(new Set(allRules.rules), expected,
      'Wrong rules')
  })

  it('finds the right tag rule', async () => {
    const allRules = new CssRules({
      a: {},
      b: {}
    })
    const rules = allRules.findRules(new TagNode('b', {}, []))
    assert.deepStrictEqual(rules, [new TagRule('b', {})],
      'Wrong tag rule found')
  })

  it('finds the right class rule', async () => {
    const allRules = new CssRules({
      '.left': {},
      '.right': {}
    })
    const node = new TagNode('b', { class: 'right' }, [])
    const rules = allRules.findRules(node)
    assert.deepStrictEqual(rules, [new ClassRule('.right', {})],
      'Wrong class rule found')
  })

  it('finds the right id rule', async () => {
    const allRules = new CssRules({
      '#up': {},
      '#down': {}
    })
    const node = new TagNode('b', { id: 'down' }, [])
    const rules = allRules.findRules(node)
    assert.deepStrictEqual(rules, [new IdRule('#down', {})],
      'Wrong id rule found')
  })

  it('finds multiple rules', async () => {
    const allRules = new CssRules({
      '.left': {},
      a: {},
      '.right': {},
      '#up': {},
      b: {},
      '#down': {}
    })
    const node = new TagNode('a', { id: 'down', class: 'left' }, [])
    const rules = allRules.findRules(node)
    const expected = [
      new IdRule('#down', {}),
      new ClassRule('.left', {}),
      new TagRule('a', {})
    ]
    assert.deepStrictEqual(rules, expected,
      'Wrong rules or wrong order')
  })
})
