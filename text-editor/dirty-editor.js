const InitEditor = require('./init-editor')

class DirtyEditor extends InitEditor {
  addState (name, initialValue) {
    if (!(name in this)) {
      this[name] = initialValue
    }
  }
}

module.exports = DirtyEditor
