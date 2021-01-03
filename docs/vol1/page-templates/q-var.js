export default {
  open: (expander, node) => {
    expander.showTag(node, false)
    expander.output(expander.env.find(node.attribs['q-var']))
  },

  close: (expander, node) => {
    expander.showTag(node, true)
  }
}
