  load (file) {
    let content = ''
    this.disableUserInteraction = true
    try {
      if (fs.existsSync(file)) {
        content = fs.readFileSync(file, 'utf8')
      }
      this.currentFile = file
    } catch (e) {
      this.drawStatusBar('ERROR: Failed to load file: ' + file, Settings.longDelay)
    }

    this.textBuffer.moveTo(0, 0)
    this.textBuffer.setText('')
    this.textBuffer.insert(content)
    this.textBuffer.moveTo(0, 0)
    this.fileIsModified = false
    this.disableUserInteraction = false
    this.draw()
  }

  save (file, callback = () => {}) {
    this.disableUserInteraction = true
    try {
      fs.writeFileSync(file, this.getText())
      this.fileIsModified = false
      this.currentFile = file
      this.drawStatusBar('Saved!', Settings.mediumDelay)
      this.disableUserInteraction = false
      callback()
    } catch (e) {
      this.disableUserInteraction = false
      callback(e)
    }
  }
