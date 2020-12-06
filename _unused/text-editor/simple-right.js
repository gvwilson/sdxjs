import KeyBinding from './simple-key-binding.js'

module.exports = new class extends KeyBinding {
  constructor () {
    super('RIGHT')
  }

  run (editor, key) {
    const line = this.getLine()
    if (editor.textBuffer.cx < line.length) {
      editor.textBuffer.moveRight()
    } else if (editor.textBuffer.getContentSize().height - 1 > editor.textBuffer.cy) {
      editor.textBuffer.moveTo(0, editor.textBuffer.cy + 1)
    }
    editor.drawCursor()
  }

  getLine () {
    return this.textBuffer.buffer[this.textBuffer.cy].reduce((acc, curr) => {
      acc += curr.char.trim()
      return acc
    }, '')
  }
}()
