const KeyBinding = require('./undo-key-binding')

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
