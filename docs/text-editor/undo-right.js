const KeyBinding = require('./undo-key-binding')

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
