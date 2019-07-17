  drawBar (pos, message, invert = false) {
    if (invert) {
      this.term.moveTo(pos.x, pos.y).styleReset.white.bold.eraseLine(' ' + message)
    } else {
      this.term.moveTo(pos.x, pos.y).styleReset.bgWhite.black.bold.eraseLine(' ' + message)
    }
  }

  drawPrompt (prompt) {
    this.drawBar({x: 0, y: this.term.height}, prompt, true)
    if (this.statusBarTimer) {
      clearTimeout(this.statusBarTimer)
    }
  }

  drawStatusBar (message = Settings.statusBar, timeout = -1) {
    this.drawBar({x: 0, y: this.term.height}, message)

    this.textBuffer.draw()
    this.screenBuffer.draw({delta: true})
    this.textBuffer.drawCursor()
    this.screenBuffer.drawCursor()

    if (this.statusBarTimer) {
      clearTimeout(this.statusBarTimer)
    }

    if (timeout >= 0) {
      this.statusBarTimer = setTimeout(() => {
        this.drawStatusBar()
      }, timeout)
    }
  }

  drawTitleBar () {
    this.drawBar({x: 1, y: 1}, Settings.titleBar)
  }
