export default {
  open: (expander, node) => {
    expander.showTag(node, true)
    expander.output(node.attribs['q-num'])
  },

  close: (expander, node) => {
    expander.showTag(node, false)
  }
}
