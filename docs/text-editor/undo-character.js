const KeyBinding = require('./undo-key-binding')

module.exports = new class extends KeyBinding {
  constructor () {
    super(null)
    this.isDefault = true
  }

  run (editor, key) {
    editor.insert(key)
    return key
  }

  undo (editor, key) {
    editor.del()
  }
}()
