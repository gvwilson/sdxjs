import KeyBinding from './undo-key-binding.js'

module.exports = new class extends KeyBinding {
  constructor () {
    super('RIGHT')
  }

  run (editor, key) {
    editor.right()
    return key
  }

  undo (editor, key) {
    editor.left()
  }
}()
