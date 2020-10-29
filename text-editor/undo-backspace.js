const KeyBinding = require('./undo-key-binding')

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
