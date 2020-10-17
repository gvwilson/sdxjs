  cutLine () {
    this.lineCutBuffer = this.textBuffer.buffer[this.textBuffer.cy]
    if (this.textBuffer.cy === 0 && this.textBuffer.buffer.length === 1) {
      this.textBuffer.buffer[0] = []
      this.textBuffer.moveToEndOfLine()
    } else {
      if (this.textBuffer.cy === this.textBuffer.buffer.length - 1) {
        this.textBuffer.buffer.splice(this.textBuffer.cy, 1, [])
      } else {
        this.textBuffer.buffer.splice(this.textBuffer.cy, 1)
      }
      if (this.textBuffer.cx >= this.textBuffer.buffer[this.textBuffer.cy].length) {
        this.textBuffer.moveToEndOfLine()
      }
    }
    this.fileIsModified = true
    this.draw()
  }

  pasteLine () {
    if (this.lineCutBuffer) {
      this.fileIsModified = true
      this.textBuffer.buffer.splice(this.textBuffer.cy, 0, this.lineCutBuffer)
      this.textBuffer.moveDown()
      this.draw()
    }
  }
