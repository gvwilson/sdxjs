import KeyBinding from './init-key-binding.js'

module.exports = new class extends KeyBinding {
  constructor () {
    super(null)
    this.isDefault = true
  }

  init (editor) {
    editor.addState('dirty', false)
  }

  run (editor, key) {
    editor.dirty = true
    editor.textBuffer.insert(key)
    editor.draw()
  }
}()
