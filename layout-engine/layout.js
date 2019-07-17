const assert = require('assert')

const {CssRules} = require('./css')
const {TextNode, TagNode} = require('./dom')
const {StyledNode} = require('./styled')

//- let DebugDepth = 0
//- let DebugIndent = '....................'

const layout = (styled, box) => {
//-  console.log(DebugIndent.slice(0, DebugDepth), 'layout >>', box, 'for', (styled instanceof TextNode) ? 'TextNode' : 'TagNode')
//-  DebugDepth += 2
  assert(styled instanceof StyledNode,
         `Require styled node for layout`)
  assert(styled.dom instanceof TagNode,
         `Can only lay out tag nodes`)
  assert(styled.get('visible'),
         `Should not construct layout node for undisplayed styled node`)

  styled.children = styled.children.filter(child => {
    return child.get('visible')
  })

  switch (styled.get('layout')) {
  case 'wrap' :
    layoutWrap(styled, box)
    break
  case 'vertical' :
    layoutVertical(styled, box)
    break
  case 'horizontal' :
    layoutHorizontal(styled, box)
    break
  default :
    assert(false,
           `Unknown layout ${styled.get('layout')}`)
  }

  assert(styled.box,
         `Failed to create box when placing styled node`)
//-  DebugDepth -= 2
//-  console.log(DebugIndent.slice(0, DebugDepth), 'layout <<', styled.box)
}

const layoutWrap = (styled, box) => {
//-  console.log(DebugIndent.slice(0, DebugDepth), 'layoutWrap >>', box)
  assert((styled.children.length === 1) && (styled.children[0].dom instanceof TextNode),
         `Node must have a single block of text`)
  assert(box.width > 0,
         `Cannot wrap in a zero-width box`)
  styled.box = {
    x: box.x,
    y: box.y,
    width: box.width,
    height: 0
  }
  const lines = splitText(box.width, styled.children[0].dom.text)
  let y = box.y
  styled.children = lines.map(line => {
    const dom = new TextNode(line)
    const child = new StyledNode(dom, new CssRules(CssRules.TEXT_RULES, false))
    child.box = {
      x: box.x,
      y: y,
      width: box.width < line.length ? box.width : line.length,
      height: 1
    }
    y += 1
    return child
  })
  styled.box.width = Math.min(...styled.children.map(child => child.box.width))
  styled.box.height = lines.length
//-  console.log(DebugIndent.slice(0, DebugDepth), 'layoutWrap <<', styled.box)
}

const layoutVertical = (styled, box) => {
//-  console.log(DebugIndent.slice(0, DebugDepth), 'layoutVertical >>', box)
  assert(styled.children.every(child => {
    const layout = child.get('layout')
    return (layout === 'horizontal') || (layout === 'wrap')
  }), `Children of vertical element must be horizontal elements`)
  styled.box = {
    x: box.x,
    y: box.y,
    width: box.width,
    height: 0
  }
  styled.children.forEach(child => {
    layout(child, styled.box)
    styled.box.y += child.box.height
  })
  styled.box.height = styled.box.y
  styled.box.y = box.y
//-  console.log(DebugIndent.slice(0, DebugDepth), 'layoutVertical <<', styled.box)
}

const layoutHorizontal = (styled, box) => {
//-  console.log(DebugIndent.slice(0, DebugDepth), 'layoutHorizontal >>', box)
  assert(styled.children.every(child => child.get('layout') === 'vertical'),
         `All children of horizontal element must be vertical elements`)
  styled.box = {
    x: box.x,
    y: box.y,
    width: box.width,
    height: 0
  }
  const minimum = styled.children.reduce((result, child) => {
    const width = child.get('width', 0)
    return width < result ? width : result
  }, 0)
  if (minimum < box.width) {
    layoutHorizontalUnderflow(styled, box, minimum)
  }
  else {
    layoutHorizontalOverflow(styled, box, minimum)
  }
  styled.box.height = Math.max(...styled.children.map(child => child.box.height))
//-  console.log(DebugIndent.slice(0, DebugDepth), 'layoutHorizontal <<', styled.box)
}

const layoutHorizontalUnderflow = (styled, box, minimum) => {
  const slack = box.width - minimum
  const numElastic = styled.children.filter(child => child.get('width', 0) === 0).length
  const elasticWidth = Math.floor(slack / numElastic)
  let currentWidth = elasticWidth + (slack - (numElastic * elasticWidth))
  let x = box.x
  const result = []
  styled.children.forEach(child => {
    if (currentWidth > 0) {
      const width = child.get('width', currentWidth)
      currentWidth = elasticWidth
      layout(child, {
        x: x,
        y: box.y,
        width: width,
        height: 0
      })
      x += width
      result.push(child)
    }
  })
  styled.children = result
}

const layoutHorizontalOverflow = (styled, box, minimum) => {
  let x = box.x
  let result = []
  styled.children.forEach(child => {
    const width = child.get('width', 0)
    if ((width > 0) && (x < box.width)) {
      layout(child, {
        x: x,
        y: box.y,
        width: width,
        height: 0
      })
      x += width
      result.append(child)
    }
  })
  styled.children = result
}

const splitText = (width, text) => {
  const result = []
  let current = null
  text.trim().split(/\s+/).forEach(chunk => {
    if (current === null) {
      current = chunk
    }
    else {
      const candidate = current + ' ' + chunk
      if (candidate.length > width) {
        result.push(current)
        current = chunk
      }
      else {
        current = candidate
      }
    }
  })
  result.push(current)
  return result
}

module.exports = {layout}
