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
