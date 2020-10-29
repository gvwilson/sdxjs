const KeyBinding = require('./undo-key-binding')

module.exports = new class extends KeyBinding {
  constructor () {
    super('CTRL_U')
  }

  run (editor, key) {
    editor.undo()
    return null
  }
}()
