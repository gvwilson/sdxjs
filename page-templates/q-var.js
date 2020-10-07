const getAttr = require('./get-attr')

module.exports = {
  open: (expander, node) => {
    expander.showTag(node, true)
    expander.output(expander.env.find(getAttr(node, 'q-var')))
  },

  close: (expander, node) => {
    expander.showTag(node, false)
  }
}
