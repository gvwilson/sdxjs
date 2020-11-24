export default {
  open: (expander, node) => {
    const doRest = expander.env.find(node.attribs['q-if'])
    if (doRest) {
      expander.showTag(node, true)
    }
    return doRest
  },

  close: (expander, node) => {
    if (expander.env.find(node.attribs['q-if'])) {
      expander.showTag(node, false)
    }
  }
}
