  deleteChar () {
    this.fileIsModified = true
    this.textBuffer.delete(1)
    this.draw()
  }

  backspace () {
    this.fileIsModified = true
    this.textBuffer.backDelete(1)
    this.draw()
  }

  newLine () {
    this.fileIsModified = true
    this.textBuffer.newLine()
    this.draw()
  }

  tab () {
    this.fileIsModified = true
    this.textBuffer.insert('\t')
    this.draw()
  }
