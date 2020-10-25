const KeyBinding = require('./init-key-binding')

module.exports = new class extends KeyBinding {
  constructor () {
    super('CTRL_C')
  }

  run (editor, key) {
    editor.exit()
  }
}()
