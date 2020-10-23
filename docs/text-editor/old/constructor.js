  constructor (options = {}) {
    this.term = terminalKit.terminal
    this.statusBarTimer = undefined
    this.fileIsModified = false

    this.screenBuffer = new terminalKit.ScreenBuffer({
      dst: this.term,
      height: this.term.height - 2,
      y: 2
    })

    this.textBuffer = new terminalKit.TextBuffer({
      dst: this.screenBuffer
    })
    this.textBuffer.setText('')
  }
