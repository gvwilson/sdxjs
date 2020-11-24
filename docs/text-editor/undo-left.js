import KeyBinding from './undo-key-binding.js'

module.exports = new class extends KeyBinding {
  constructor () {
    super('LEFT')
  }

  run (editor, key) {
    editor.left()
    return key
  }

  undo (editor, key) {
    editor.right()
  }
}()
