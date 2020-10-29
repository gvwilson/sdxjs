const KeyBinding = require('./undo-key-binding')

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
