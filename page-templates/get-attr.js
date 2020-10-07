const assert = require('assert')

module.exports = (node, name) => {
  const found = node.attrs.filter(attr => (attr.name === name))
  assert(found.length < 2,
         `Node has multiple attributes ${name}`)
  return (found.length === 0) ? null : found[0].value
}
