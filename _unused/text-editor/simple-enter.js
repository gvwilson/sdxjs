import KeyBinding from './simple-key-binding.js'

module.exports = new class extends KeyBinding {
  constructor () {
    super('ENTER')
  }

  run (editor, key) {
    editor.newLine()
  }
}()
