import KeyBinding from './undo-key-binding.js'

module.exports = new class extends KeyBinding {
  constructor () {
    super('BACKSPACE')
  }

  run (editor, key) {
    return editor.del()
  }

  undo (editor, key) {
    editor.insert(key)
  }
}()
