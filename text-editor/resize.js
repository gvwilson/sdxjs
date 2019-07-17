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
    }, Settings.shortDelay)
  }
