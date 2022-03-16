export default {
  open: (expander, node) => {
    expander.showTag(node, false)
    expander.output(node.attribs['z-num'])
  },

  close: (expander, node) => {
    expander.showTag(node, true)
  }
}
