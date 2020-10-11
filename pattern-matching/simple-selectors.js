const assert = require('assert')

const select = (root, selector) => {
  const selectors = selector.split(' ').filter(s => s.length > 0)
  return firstMatch(root, selectors)
}

const firstMatch = (node, selectors) => {
  assert(selectors.length > 0,
         `Require selector(s)`)

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

const firstChildMatch = (node, selectors) => {
  // No children.
  if ((!('childNodes' in node)) || (node.childNodes.length === 0)) {
    return null
  }

  // First working match.
  for (const child of node.childNodes) {
    const match = firstMatch(child, selectors)
    if (match) {
      return match
    }
  }

  // Nothing worked.
  return null
}

const matchHere = (node, selector) => {
  let tag = null, id = null, cls = null
  if (selector.includes('#')) {
    [tag, id] = selector.split('#')
  }
  else if (selector.includes('.')) {
    [tag, cls] = selector.split('.')
  }
  else {
    tag = selector
  }
  return (node.nodeName === tag)
    && ((id === null) || (getAttr(node, 'id') === id))
    && ((cls === null) || (getAttr(node, 'class') === cls))
}

const getAttr = (node, name) => {
  const found = node.attrs.filter(attr => (attr.name === name))
  assert(found.length < 2,
         `Node has multiple attributes ${name}`)
  return (found.length === 0) ? null : found[0].value
}

module.exports = select
