const KeyBinding = require('./key-binding')

module.exports = new class extends KeyBinding {
  constructor () {
    super('ENTER')
  }

  run (editor, key) {
    editor.newLine()
  }
}()
