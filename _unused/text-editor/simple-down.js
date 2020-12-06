import KeyBinding from './simple-key-binding.js'

module.exports = new class extends KeyBinding {
  constructor () {
    super('DOWN')
  }

  run (editor, key) {
    if (editor.textBuffer.getContentSize().height - 1 > editor.textBuffer.cy) {
      editor.textBuffer.moveDown()
      if (editor.textBuffer.cx > editor.textBuffer.buffer[editor.textBuffer.cy].length - 1) {
        editor.textBuffer.moveToEndOfLine()
      }
      editor.drawCursor()
    }
  }
}()
