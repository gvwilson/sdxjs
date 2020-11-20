const terminalKit = require('terminal-kit')

const SETTINGS = {
  statusBar: 'Ctrl+  C:exit',
  titleBar: 'Zepto',
  shortDelay: 100,
  mediumDelay: 2000,
  longDelay: 3500
}

class MinimalEditor {
  // <body>
  // <constructor>
  constructor (args) {
    this.settings = { ...SETTINGS }
    this.term = terminalKit.terminal
    this.statusBarTimer = undefined

    this.screenBuffer = new terminalKit.ScreenBuffer({
      dst: this.term,
      height: this.term.height - 2,
      y: 2
    })

    this.textBuffer = new terminalKit.TextBuffer({ dst: this.screenBuffer })
    this.textBuffer.setText('')

    this.term.on('resize', this.onResize.bind(this))
    this.term.on('key', this.onKey.bind(this))

    this.term.fullscreen(true)

    this.textBuffer.moveTo(0, 0)
    this.screenBuffer.moveTo(0, 0)

    this.term.grabInput({ mouse: false })
    this.drawStatusBar()
    this.drawTitleBar()

    this.draw()
  }
  // </constructor>

  // <drawbar>
  drawBar (pos, message, invert = false) {
    if (invert) {
      this.term.moveTo(pos.x, pos.y)
        .styleReset.white.bold.eraseLine(' ' + message)
    } else {
      this.term.moveTo(pos.x, pos.y)
        .styleReset.bgWhite.black.bold.eraseLine(' ' + message)
    }
  }

  drawStatusBar (message = this.settings.statusBar, timeout = -1) {
    this.drawBar({ x: 0, y: this.term.height }, message)

    this.textBuffer.draw()
    this.screenBuffer.draw({ delta: true })
    this.textBuffer.drawCursor()
    this.screenBuffer.drawCursor()

    if (this.statusBarTimer) {
      clearTimeout(this.statusBarTimer)
    }

    if (timeout >= 0) {
      this.statusBarTimer = setTimeout(() => this.drawStatusBar(), timeout)
    }
  }

  drawTitleBar () {
    this.drawBar({ x: 1, y: 1 }, this.settings.titleBar)
  }
  // </drawbar>

  // <exit>
  exit () {
    setTimeout(() => {
      this.term.grabInput(false)
      this.term.fullscreen(false)
      setTimeout(() => process.exit(0), this.settings.shortDelay)
    }, this.settings.shortDelay)
  }
  // </exit>

  // <resize>
  onResize (width, height) {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer)
    }
    this.resizeTimer = setTimeout(() => {
      this.screenBuffer.resize({
        x: 0,
        y: 2,
        width: width,
        height: height - 2
      })
      this.drawStatusBar()
      this.drawTitleBar()
      this.draw()
    }, this.settings.shortDelay)
  }
  // </resize>

  // <onkey>
  onKey (key, matches, data) {
    switch (key) {
      case 'CTRL_C':
        this.exit()
        break
      case 'ENTER':
        this.newLine()
        break
      default:
        if (data.isCharacter) {
          this.textBuffer.insert(key)
          this.draw()
        }
        break
    }
  }
  // </onkey>

  // <draw>
  draw () {
    this.textBuffer.draw()
    this.screenBuffer.draw({ delta: true })
    this.drawCursor()
  }

  drawCursor () {
    let newBufferX = this.textBuffer.x
    let newBufferY = this.textBuffer.y

    if (this.textBuffer.x < -this.textBuffer.cx) {
      newBufferX = Math.min(0, -this.textBuffer.cx +
                                Math.floor(this.screenBuffer.width / 2))
    } else if (this.textBuffer.x >
               -this.textBuffer.cx + this.screenBuffer.width - 1) {
      newBufferX = (this.screenBuffer.width / 2) - this.textBuffer.cx
    }

    if (this.textBuffer.y < -this.textBuffer.cy) {
      newBufferY = Math.min(0, -this.textBuffer.cy +
                               Math.floor(this.screenBuffer.height / 2))
    } else if (this.textBuffer.y >
               -this.textBuffer.cy + this.screenBuffer.height - 1) {
      newBufferY = (this.screenBuffer.height / 2) - this.textBuffer.cy
    }

    if (newBufferY !== this.textBuffer.y ||
        newBufferX !== this.textBuffer.x) {
      this.textBuffer.x = newBufferX
      this.textBuffer.y = newBufferY
      this.textBuffer.draw()
      this.screenBuffer.draw({ delta: true })
    }

    this.textBuffer.drawCursor()
    this.screenBuffer.drawCursor()
  }
  // </draw>

  // <newline>
  newLine () {
    this.textBuffer.newLine()
    this.draw()
  }
  // </newline>
  // </body>
}

module.exports = MinimalEditor
