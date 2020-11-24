import KeyBinding from './undo-key-binding.js'

module.exports = new class extends KeyBinding {
  constructor () {
    super('DOWN')
  }

  run (editor, key) {
    editor.down()
    return key
  }

  undo (editor, key) {
    editor.up()
  }
}()
