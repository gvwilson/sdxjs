const KeyBinding = require('./undo-key-binding')

module.exports = new class extends KeyBinding {
  constructor () {
    super('ENTER')
  }

  run (editor, key) {
    editor.newLine()
    return key
  }

  undo (editor, key) {
    editor.del()
  }
}()
