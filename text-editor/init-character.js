import KeyBinding from './init-key-binding.js'

module.exports = new class extends KeyBinding {
  constructor () {
    super(null)
    this.isDefault = true
  }

  run (editor, key) {
    editor.textBuffer.insert(key)
    editor.draw()
  }
}()
