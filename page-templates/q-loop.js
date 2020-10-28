module.exports = {
  open: (expander, node) => {
    const [indexName, targetName] = node.attribs['q-loop'].split(':')
    delete node.attribs['q-loop']
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
