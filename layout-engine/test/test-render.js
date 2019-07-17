const assert = require('assert')

const {TextNode, TagNode} = require('../dom')
const {CssRules} = require('../css')
const {StyledNode} = require('../styled')
const {render} = require('../render')

const EmptyCSS = new CssRules({})

const makeBox = (x, y, width, height) => {
  return {x, y, width, height}
}

const assignBoxes = (node, boxes) => {
  node.box = boxes[0]
  if ('children' in node) {
    assert.equal(node.children.length, boxes.length - 1,
                 `Must have as many boxes as children`)
    node.children.forEach((child, i) => {
      assignBoxes(child, boxes[i+1])
    })
  }
}

describe('renders styled nodes', () => {
  it('fills a 1x1 screen with a 1-character paragraph', async () => {
    const dom = new TagNode('p', {}, [new TextNode('X')])
    const styled = new StyledNode(dom, EmptyCSS)
    const box = makeBox(0, 0, 1, 1)
    assignBoxes(styled, [box, [box]])
    const result = render(styled, 1, 1)
    assert.equal(result, 'X',
                 `Expected paragraph to fill the screen`)
  })

  it('pads a 2x2 screen with a 1-character paragraph', async () => {
    const dom = new TagNode('p', {}, [new TextNode('X')])
    const styled = new StyledNode(dom, EmptyCSS)
    const box = makeBox(0, 0, 1, 1)
    assignBoxes(styled, [box, [box]])
    const result = render(styled, 2, 2)
    const expected = ['X.', '..'].join('\n')
    assert.equal(result, expected,
                 `Expected text to fill upper left corner of screen`)
  })

  it('renders two consecutive paragraphs', async () => {
    const dom = new TagNode('col', {}, [
      new TagNode('p', {}, [new TextNode('AB')]),
      new TagNode('p', {}, [new TextNode('CD')])
    ])
    const styled = new StyledNode(dom, EmptyCSS)
    const overallBox = makeBox(0, 0, 2, 2),
          firstParaBox = makeBox(0, 0, 2, 1),
          secondParaBox = makeBox(0, 1, 2, 1)
    assignBoxes(styled, [overallBox,
                         [firstParaBox, [firstParaBox]],
                         [secondParaBox, [secondParaBox]]])
    const result = render(styled, 2, 2)
    const expected = ['AB', 'CD'].join('\n')
    assert.equal(result, expected,
                 `Expected paragraphs to fill screen`)
  })

  it('hides overflow of single paragraph', async () => {
    const dom = new TagNode('p', {}, [new TextNode('1234')])
    const styled = new StyledNode(dom, EmptyCSS)
    const narrowBox = makeBox(0, 0, 2, 1)
    assignBoxes(styled, [narrowBox, [narrowBox]])
    const result = render(styled, 2, 1)
    assert.equal(result, '12',
                 `Expected paragraph to be truncated`)
  })

  it('puts columns side by side', async () => {
    const dom = new TagNode('row', {}, [
      new TagNode('col', {}, [
        new TagNode('p', {}, [new TextNode('LL')])
      ]),
      new TagNode('col', {}, [
        new TagNode('p', {}, [new TextNode('RR')])
      ])
    ])
    const styled = new StyledNode(dom, EmptyCSS)
    const overallBox = makeBox(0, 0, 6, 1),
          leftBox = makeBox(0, 0, 3, 1),
          rightBox = makeBox(3, 0, 3, 1)
    assignBoxes(styled, [overallBox,
                         [leftBox, [leftBox, [leftBox]]],
                         [rightBox, [rightBox, [rightBox]]]])
    const result = render(styled, 6, 1)
    assert.equal(result, 'LL.RR.',
                 `Columns not laid out side by side`)
  })
})
