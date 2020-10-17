const assert = require('assert')

const { TextNode, TagNode } = require('./dom')

const render = (layout, width, height, fillChar = '.') => {
  const screen = new Array(width).fill(null)
  screen.forEach((val, i) => {
    screen[i] = new Array(height).fill(fillChar)
  })
  fill(screen, layout, fillChar)
  const temp = []
  for (let y = 0; y < height; y += 1) {
    const chars = []
    for (let x = 0; x < width; x += 1) {
      chars.push(screen[x][y])
    }
    temp.push(chars.join(''))
  }
  return temp.join('\n')
}

const fill = (screen, layout, fillChar) => {
  if (layout.dom instanceof TagNode) {
    layout.children.forEach(child => fill(screen, child, fillChar))
    return
  }

  assert(layout.dom instanceof TextNode,
    'Can only handle tag nodes and text nodes')

  const text = layout.dom.text
  let i = 0
  while ((i < layout.box.width) && (i < text.length)) {
    screen[layout.box.x + i][layout.box.y] = text[i]
    i += 1
  }

  while (i < layout.box.width) {
    screen[layout.box.x + i][layout.box.y] = fillChar
    i += 1
  }
}

module.exports = { render }
