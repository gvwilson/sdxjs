import assert from 'assert'

import parseHTML from '../parse.js'
import {
  IdRule,
  ClassRule,
  TagRule,
  CssRuleSet
} from '../micro-css.js'

describe('styles tree', () => {
  it('styles a single node with a single rule', async () => {
    const dom = parseHTML('<row></row>')
    const rules = new CssRuleSet({
      row: { width: 20 }
    })
    dom.findRules(rules)
    assert.deepStrictEqual(dom.rules, [
      new TagRule('row', { width: 20 })
    ])
  })

  it('styles a single node with multiple rules', async () => {
    const dom = parseHTML('<row id="name" class="kind"></row>')
    const rules = new CssRuleSet({
      row: { width: 20 },
      '.kind': { width: 5 },
      '#name': { height: 10 }
    })
    dom.findRules(rules)
    assert.deepStrictEqual(dom.rules, [
      new IdRule('#name', { height: 10 }),
      new ClassRule('.kind', { width: 5 }),
      new TagRule('row', { width: 20 })
    ])
  })

  // [test]
  it('styles a tree of nodes with multiple rules', async () => {
    const html = [
      '<col id="name">',
      '<row class="kind">first\nsecond</row>',
      '<row>third\nfourth</row>',
      '</col>'
    ]
    const dom = parseHTML(html.join(''))
    const rules = new CssRuleSet({
      '.kind': { height: 3 },
      '#name': { height: 5 },
      row: { width: 10 }
    })
    dom.findRules(rules)
    assert.deepStrictEqual(dom.rules, [
      new IdRule('#name', { height: 5 })
    ])
    assert.deepStrictEqual(dom.children[0].rules, [
      new ClassRule('.kind', { height: 3 }),
      new TagRule('row', { width: 10 })
    ])
    assert.deepStrictEqual(dom.children[1].rules, [
      new TagRule('row', { width: 10 })
    ])
  })
  // [/test]
})
