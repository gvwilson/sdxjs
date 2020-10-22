  startOfLine () {
    this.textBuffer.moveToColumn(0)
    this.drawCursor()
  }

  endOfLine () {
    this.textBuffer.moveToEndOfLine()
    this.drawCursor()
  }

  startOfText () {
    this.textBuffer.moveTo(0, 0)
    this.draw()
  }

  endOfText () {
    const num_lines = this.textBuffer.getContentSize().height - 1
    const last_line = this.textBuffer.buffer[num_lines]
    this.textBuffer.moveTo(last_line.length, num_lines)
    this.draw()
  }

  pgUp () {
    this.textBuffer.cy = Math.max(0, this.textBuffer.cy - Math.floor(this.screenBuffer.height / 2))
    this.draw()
  }

  pgDown () {
    this.textBuffer.cy = Math.min(this.textBuffer.getContentSize().height - 1,
                                  this.textBuffer.cy + Math.floor(this.screenBuffer.height / 2))
    this.draw()
  }
