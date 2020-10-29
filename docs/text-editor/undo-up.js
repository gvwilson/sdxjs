const KeyBinding = require('./undo-key-binding')

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
