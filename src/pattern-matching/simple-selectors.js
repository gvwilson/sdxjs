import assert from 'assert'

const select = (root, selector) => {
  const selectors = selector.split(' ').filter(s => s.length > 0)
  return firstMatch(root, selectors)
}

const firstMatch = (node, selectors) => {
  assert(selectors.length > 0,
    'Require selector(s)')

  // Not a tag.
  if (node.type !== 'tag') {
    return null
  }

  // This node matches.
  if (matchHere(node, selectors[0])) {
    // This is the last selector, so matching worked.
    if (selectors.length === 1) {
      return node
    }

    // Try to match remaining selectors.
    return firstChildMatch(node, selectors.slice(1))
  }

  // This node doesn't match, so try further down.
  return firstChildMatch(node, selectors)
}

// [skip]
// [firstChild]
const firstChildMatch = (node, selectors) => {
  assert(node.type === 'tag',
    `Should only try to match first child of tags, not ${node.type}`)

  // First working match.
  for (const child of node.children) {
    const match = firstMatch(child, selectors)
    if (match) {
      return match
    }
  }

  // Nothing worked.
  return null
}
// [/firstChild]

// [matchHere]
const matchHere = (node, selector) => {
  let name = null
  let id = null
  let cls = null
  if (selector.includes('#')) {
    [name, id] = selector.split('#')
  } else if (selector.includes('.')) {
    [name, cls] = selector.split('.')
  } else {
    name = selector
  }
  return (node.name === name) &&
    ((id === null) || (node.attribs.id === id)) &&
    ((cls === null) || (node.attribs.class === cls))
}
// [/matchHere]
// [/skip]

export default select
