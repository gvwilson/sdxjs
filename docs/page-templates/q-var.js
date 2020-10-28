module.exports = {
  open: (expander, node) => {
    expander.showTag(node, true)
    expander.output(expander.env.find(node.attribs['q-var']))
  },

  close: (expander, node) => {
    expander.showTag(node, false)
  }
}
