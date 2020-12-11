const render = (root) => {
  root.place(0, 0)
  const width = root.getWidth()
  const height = root.getHeight()
  const screen = makeScreen(width, height)
  draw(screen, root)
  return screen.map(row => row.join('')).join('\n')
}

// <makeScreen>
const makeScreen = (width, height) => {
  const screen = []
  for (let i = 0; i < height; i += 1) {
    screen.push(new Array(width).fill(' '))
  }
  return screen
}
// </makeScreen>

// <draw>
const draw = (screen, node, fill = null) => {
  fill = nextFill(fill)
  drawBlock(screen, node, fill)
  if ('children' in node) {
    node.children.forEach(child => {
      fill = draw(screen, child, fill)
    })
  }
  return fill
}

const nextFill = (fill) => {
  return (fill === null)
    ? 'a'
    : String.fromCharCode(fill.charCodeAt() + 1)
}
// </draw>

const drawBlock = (screen, node, fill) => {
  for (let ix = 0; ix < node.getWidth(); ix += 1) {
    for (let iy = 0; iy < node.getHeight(); iy += 1) {
      screen[node.y0 + iy][node.x0 + ix] = fill
    }
  }
}

export default render
