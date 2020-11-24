import KeyBinding from './undo-key-binding.js'

module.exports = new class extends KeyBinding {
  constructor () {
    super('CTRL_U')
  }

  run (editor, key) {
    editor.undo()
    return null
  }
}()
