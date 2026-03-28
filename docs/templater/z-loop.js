export default {
  open: (expander, node) => {
    const [indexName, targetName] = node.attribs['z-loop'].split(':')
    delete node.attribs['z-loop']
    expander.showTag(node, false)
    const target = expander.env.find(targetName)
    for (const index of target) {
      expander.env.push({ [indexName]: index })
      node.children.forEach(child => expander.walk(child))
      expander.env.pop()
    }
    return false
  },

  close: (expander, node) => {
    expander.showTag(node, true)
  }
}
