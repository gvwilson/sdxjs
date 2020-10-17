const assert = require('assert')

const { TextNode, TagNode } = require('../dom')
const { CssRules } = require('../css')
const { StyledNode } = require('../styled')
const { layout } = require('../layout')

const EmptyCSS = new CssRules({})

const makeBox = (x, y, width, height) => {
  return { x, y, width, height }
}

const checkBoxes = (node, boxes) => {
  assert.deepStrictEqual(node.box, boxes[0],
                   `Mismatch between ${node} and ${boxes[0]}`)
  if ('children' in node) {
    assert.strictEqual(node.children.length, boxes.length - 1,
      'Must have as many boxes as children')
    node.children.forEach((child, i) => {
      checkBoxes(child, boxes[i + 1])
    })
  }
}

describe('lays out nodes', () => {
  it('lays out a 1-character paragraph', async () => {
    const dom = new TagNode('p', {}, [new TextNode('X')])
    const styled = new StyledNode(dom, EmptyCSS)
    layout(styled, makeBox(0, 0, 1, 1))
    const box = makeBox(0, 0, 1, 1)
    checkBoxes(styled, [box, [box]])
  })

  it('lays out a paragraph in a larger space', async () => {
    const dom = new TagNode('p', {}, [new TextNode('X')])
    const styled = new StyledNode(dom, EmptyCSS)
    layout(styled, makeBox(0, 0, 2, 2))
    const box = makeBox(0, 0, 1, 1)
    checkBoxes(styled, [box, [box]])
  })

  it('lays out two consecutive paragraphs', async () => {
    const dom = new TagNode('col', {}, [
      new TagNode('p', {}, [new TextNode('AB')]),
      new TagNode('p', {}, [new TextNode('CD')])
    ])
    const styled = new StyledNode(dom, EmptyCSS)
    layout(styled, makeBox(0, 0, 2, 2))
    const overallBox = makeBox(0, 0, 2, 2)
    const firstParaBox = makeBox(0, 0, 2, 1)
    const secondParaBox = makeBox(0, 1, 2, 1)
    checkBoxes(styled, [overallBox,
      [firstParaBox, [firstParaBox]],
      [secondParaBox, [secondParaBox]]])
  })

  it('lays out a single overflow paragraph', async () => {
    const dom = new TagNode('p', {}, [new TextNode('1234')])
    const styled = new StyledNode(dom, EmptyCSS)
    layout(styled, makeBox(0, 0, 2, 1))
    const narrowBox = makeBox(0, 0, 2, 1)
    checkBoxes(styled, [narrowBox, [narrowBox]])
  })

  it('lays out columns side by side', async () => {
    const dom = new TagNode('row', {}, [
      new TagNode('col', {}, [
        new TagNode('p', {}, [new TextNode('LL')])
      ]),
      new TagNode('col', {}, [
        new TagNode('p', {}, [new TextNode('RR')])
      ])
    ])
    const styled = new StyledNode(dom, EmptyCSS)
    layout(styled, makeBox(0, 0, 6, 1))
    const overallBox = makeBox(0, 0, 6, 1)
    const leftBox = makeBox(0, 0, 3, 1)
    const leftTextBox = makeBox(0, 0, 2, 1)
    const rightBox = makeBox(3, 0, 3, 1)
    const rightTextBox = makeBox(3, 0, 2, 1)
    checkBoxes(styled, [overallBox,
      [leftBox, [leftTextBox, [leftTextBox]]],
      [rightBox, [rightTextBox, [rightTextBox]]]])
  })
})
