const KeyBinding = require('./init-key-binding')

module.exports = new class extends KeyBinding {
  constructor () {
    super('BACKSPACE')
  }

  init (editor) {
    editor.addState('dirty', false)
  }

  run (editor, key) {
    editor.dirty = true
    editor.textBuffer.backDelete(1)
    editor.draw()
  }
}()
