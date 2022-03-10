export default {
  open: (expander, node) => {
    const doRest = expander.env.find(node.attribs['z-if'])
    if (doRest) {
      expander.showTag(node, false)
    }
    return doRest
  },

  close: (expander, node) => {
    if (expander.env.find(node.attribs['z-if'])) {
      expander.showTag(node, true)
    }
  }
}
