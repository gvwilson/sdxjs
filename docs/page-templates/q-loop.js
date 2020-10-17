const getAttr = require('./get-attr')

module.exports = {
  open: (expander, node) => {
    const [indexName, targetName] = getAttr(node, 'q-loop').split(':')
    node.attrs = node.attrs.filter(attr => attr.name !== 'q-loop')
    const target = expander.env.find(targetName)
    for (const index of target) {
      expander.env.push({ [indexName]: index })
      expander.walk(node)
      expander.env.pop()
    }
    return false
  },

  close: (expander, node) => {
    // do nothing
  }
}
