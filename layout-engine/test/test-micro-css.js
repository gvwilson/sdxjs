import assert from 'assert'

import { TagNode } from '../micro-dom.js'
import { IdRule, ClassRule, TagRule } from '../micro-css.js'
import CssRuleSet from '../micro-css-ruleset.js'

describe('manages style rules', () => {
  it('converts empty JSON to empty rules', async () => {
    const allRules = new CssRuleSet({})
    assert.strictEqual(allRules.rules.length, 0)
  })

  it('converts a mixture of rules', async () => {
    const allRules = new CssRuleSet({
      '.cls': { width: 20 },
      '#top': { color: '#0000ff' },
      body: { 'font-weight': 'bold' }
    })
    const expected = new Set([
      new ClassRule('.cls', { width: 20 }),
      new IdRule('#top', { color: '#0000ff' }),
      new TagRule('body', { 'font-weight': 'bold' })
    ])
    assert.deepStrictEqual(new Set(allRules.rules), expected)
  })

  it('finds the right tag rule', async () => {
    const allRules = new CssRuleSet({
      a: {},
      b: {}
    })
    const rules = allRules.findRules(new TagNode('b', {}))
    assert.deepStrictEqual(rules, [new TagRule('b', {})])
  })

  it('finds the right class rule', async () => {
    const allRules = new CssRuleSet({
      '.left': {},
      '.right': {}
    })
    const node = new TagNode('b', { class: 'right' })
    const rules = allRules.findRules(node)
    assert.deepStrictEqual(rules, [new ClassRule('.right', {})])
  })

  it('finds the right id rule', async () => {
    const allRules = new CssRuleSet({
      '#up': {},
      '#down': {}
    })
    const node = new TagNode('b', { id: 'down' })
    const rules = allRules.findRules(node)
    assert.deepStrictEqual(rules, [new IdRule('#down', {})])
  })

  it('finds multiple rules', async () => {
    const allRules = new CssRuleSet({
      '.left': {},
      a: {},
      '.right': {},
      '#up': {},
      b: {},
      '#down': {}
    })
    const node = new TagNode('a', { id: 'down', class: 'left' })
    const rules = allRules.findRules(node)
    const expected = [
      new IdRule('#down', {}),
      new ClassRule('.left', {}),
      new TagRule('a', {})
    ]
    assert.deepStrictEqual(rules, expected)
  })
})
