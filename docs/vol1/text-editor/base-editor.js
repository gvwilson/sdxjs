import terminalKit from 'terminal-kit'

const CONTROLS = [
  'X:save & eXit',
  'C:exit',
  'O:Open',
  'S:Save',
  'A:save As',
  'K:cut line',
  'U:paste line'
]

const STATUS_BAR = 'Ctrl+  ' + CONTROLS.join(' / ')
const TITLE_BAR = 'Zepto'
const SHORT_DELAY = 100

export default class BaseEditor {
  constructor () {
    this.term = terminalKit.terminal
    this.statusBar = STATUS_BAR
    this.titleBar = TITLE_BAR
    this.shortDelay = SHORT_DELAY
    this.fileIsModified = false
    this.statusBarTimer = undefined

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

  // <skip>
  init (file) {
    this.term.on('resize', this.onResize.bind(this))
    this.term.on('key', this.onKey.bind(this))

    this.term.fullscreen(true)

    this.textBuffer.moveTo(0, 0)
    this.screenBuffer.moveTo(0, 0)

    this.term.grabInput({
      mouse: false
    })
    this.drawStatusBar()
    this.drawTitleBar()

    this.draw()

    if (file) {
      this.load(file)
    }
  }

  drawBar (pos, message, invert = false) {
    if (invert) {
      this.term.moveTo(pos.x, pos.y).styleReset.white.bold.eraseLine(' ' + message)
    } else {
      this.term.moveTo(pos.x, pos.y).styleReset.bgWhite.black.bold.eraseLine(' ' + message)
    }
  }

  drawPrompt (prompt) {
    this.drawBar({ x: 0, y: this.term.height }, prompt, true)
    if (this.statusBarTimer) {
      clearTimeout(this.statusBarTimer)
    }
  }

  drawStatusBar (message = this.statusBar, timeout = -1) {
    this.drawBar({ x: 0, y: this.term.height }, message)

    this.draw()
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
    this.drawBar({ x: 1, y: 1 }, this.titleBar)
  }

  load (file) {
    console.error('LOAD UNIMPLEMENTED')
  }

  // <onKey>
  onKey (key, matches, data) {
    this.exit() // FIXME
  }

  exit () {
    setTimeout(() => {
      this.term.grabInput(false)
      this.term.fullscreen(false)
      setTimeout(() => process.exit(0), this.shortDelay)
    }, this.shortDelay)
  }
  // </onKey>

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
    }, this.shortDelay)
  }

  draw () {
    this.textBuffer.draw()
    this.screenBuffer.draw({ delta: true })
    this.drawCursor()
  }

  drawCursor () {
    let newBufferX = this.textBuffer.x
    let newBufferY = this.textBuffer.y

    if (this.textBuffer.x < -this.textBuffer.cx) {
      newBufferX = Math.min(0, -this.textBuffer.cx + Math.floor(this.screenBuffer.width / 2))
    } else if (this.textBuffer.x > -this.textBuffer.cx + this.screenBuffer.width - 1) {
      newBufferX = (this.screenBuffer.width / 2) - this.textBuffer.cx
    }

    if (this.textBuffer.y < -this.textBuffer.cy) {
      newBufferY = Math.min(0, -this.textBuffer.cy + Math.floor(this.screenBuffer.height / 2))
    } else if (this.textBuffer.y > -this.textBuffer.cy + this.screenBuffer.height - 1) {
      newBufferY = (this.screenBuffer.height / 2) - this.textBuffer.cy
    }

    if (newBufferY !== this.textBuffer.y || newBufferX !== this.textBuffer.x) {
      this.textBuffer.x = newBufferX
      this.textBuffer.y = newBufferY
      this.textBuffer.draw()
      this.screenBuffer.draw({ delta: true })
    }

    this.textBuffer.drawCursor()
    this.screenBuffer.drawCursor()
  }
  // </skip>
}
