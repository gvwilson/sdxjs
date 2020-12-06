import KeyBinding from './undo-key-binding.js'

module.exports = new class extends KeyBinding {
  constructor () {
    super('CTRL_C')
  }

  run (editor, key) {
    editor.exit()
    return null
  }
}()
