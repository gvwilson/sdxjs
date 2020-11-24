import KeyBinding from './undo-key-binding.js'

module.exports = new class extends KeyBinding {
  constructor () {
    super('UP')
  }

  run (editor, key) {
    editor.up()
    return key
  }

  undo (editor, key) {
    editor.down()
  }
}()
