const getAttr = require('./get-attr')

module.exports = {
  open: (expander, node) => {
    const doRest = expander.env.find(getAttr(node, 'q-if'))
    if (doRest) {
      expander.showTag(node, true)
    }
    return doRest
  },

  close: (expander, node) => {
    if (expander.env.find(getAttr(node, 'q-if'))) {
      expander.showTag(node, false)
    }
  }
}
