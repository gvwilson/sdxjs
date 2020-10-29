const InitEditor = require('./init-editor')

class UndoEditor extends InitEditor {
  constructor (args) {
    super(args)
    this.stack = []
  }

  onKey (key, matches, data) {
    const op = this.bindings.has(key)
      ? this.bindings.get(key)
      : this.defaultBinding
    const save = op.run(this, key)
    if (save !== null) {
      this.stack.push([op, save])
    }
  }

  undo () {
    if (this.stack.length === 0) {
      return
    }
    const [op, key] = this.stack.pop()
    op.undo(this, key)
  }

  // <operations>
  insert (key) {
    this.textBuffer.insert(key)
    this.draw()
  }

  del () {
    const cx = this.textBuffer.cx
    const cy = this.textBuffer.cy
    let char = null
    if (cx === 0) {
      if (cy > 0) {
        const last = this.textBuffer.buffer[cy - 1].length - 1
        char = this.textBuffer.buffer[cy - 1][last].char
      }
    } else {
      char = this.textBuffer.buffer[cy][cx - 1].char
    }

    this.textBuffer.backDelete(1)
    this.draw()
    return char
  }

  up () {
    this.textBuffer.moveUp()
    if (this.textBuffer.cx > this.textBuffer.buffer[this.textBuffer.cy].length - 1) {
      this.textBuffer.moveToEndOfLine()
    }
    this.drawCursor()
  }

  down () {
    if (this.textBuffer.getContentSize().height - 1 > this.textBuffer.cy) {
      this.textBuffer.moveDown()
      if (this.textBuffer.cx > this.textBuffer.buffer[this.textBuffer.cy].length - 1) {
        this.textBuffer.moveToEndOfLine()
      }
      this.drawCursor()
    }
  }

  left () {
    this.textBuffer.moveBackward()
    this.drawCursor()
  }

  right () {
    if (this.textBuffer.cx < this.getLine().length) {
      this.textBuffer.moveRight()
    } else if (this.textBuffer.getContentSize().height - 1 > this.textBuffer.cy) {
      this.textBuffer.moveTo(0, this.textBuffer.cy + 1)
    }
    this.drawCursor()
  }

  getLine () {
    return this.textBuffer.buffer[this.textBuffer.cy].reduce((acc, curr) => {
      acc += curr.char.trim()
      return acc
    }, '')
  }
  // </operations>
}

module.exports = UndoEditor
