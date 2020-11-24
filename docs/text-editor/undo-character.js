import KeyBinding from './undo-key-binding.js'

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
