const getAttr = require('./get-attr')

module.exports = {
  open: (expander, node) => {
    expander.showTag(node, true)
    expander.output(getAttr(node, 'q-num'))
  },

  close: (expander, node) => {
    expander.showTag(node, false)
  }
}
