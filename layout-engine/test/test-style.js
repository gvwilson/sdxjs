const assert = require('assert')

const {TextNode, TagNode} = require('../dom')
const {parseHTML} = require('../parse')
const {CssRules} = require('../css')
const {StyledNode} = require('../styled')

describe('constructs styled tree', () => {
  it('decorates a single node with a single styled', async () => {
    const dom = parseHTML('<root></root>')
    const cssRules = new CssRules({
      root: {width: 20}
    })
    const tree = new StyledNode(dom, cssRules)
    assert(Object.is(tree.dom, dom),
           `Expected to store root`)
    assert.deepEqual(tree.rules, {width: 20},
                     `Wrong rules`)
  })

  it('applies default style to text nodes', async () => {
    const dom = new TextNode('content')
    const cssRules = new CssRules({
      text: {width: 20},
      content: {width: 20}
    })
    const tree = new StyledNode(dom, cssRules)
    assert(Object.is(tree.dom, dom),
           `Expected to store node`)
    assert.deepEqual(tree.rules, CssRules.TEXT_RULES,
                     `Expected no rules`)
  })

  it('applies styles to nested nodes', async () => {
    const dom = parseHTML('<root class="first">A<nested id="second"></nested></root>')
    const cssRules = new CssRules({
      '.first': {width: 10},
      '#second': {font: 'serif'},
      'nested': {color: '#f0f0f0'}
    })
    const tree = new StyledNode(dom, cssRules)
    assert.deepEqual(tree.rules, {width: 10},
                     `Wrong rules for root node`)
    assert.equal(tree.children.length, 2,
                 `Root node has wrong number of children`)
    assert.deepEqual(tree.children[1].rules, {font: 'serif', color: '#f0f0f0'},
                     `Wrong rules for nested node`)
  })
})
