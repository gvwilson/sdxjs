  open () {
    this.getFileNameFromUser('Open file: ', file => this.load(file))
  }

  saveAs (callback) {
    this.getFileNameFromUser('Save as: ',
                             file => this.save(file, callback),
                             this.currentFile)
  }

  saveFile () {
    if (!this.fileIsModified){
      return
    }

    if (this.getText() === ''){
      return
    }

    if (this.currentFile) {
      this.save(this.currentFile)
    } else {
      this.saveAs()
    }
  }

  saveAndExit () {
    this.saveAs(err => {
      if (err) {
        this.drawStatusBar('ERR: Could not save file. Hit Ctrl + C to force exit.',
                           Settings.longDelay)
        return
      }
      this.exit()
    })
  }

  exit () {
    setTimeout(() => {
      this.term.grabInput(false)
      this.term.fullscreen(false)
      setTimeout(() => process.exit(0), Settings.shortDelay)
    }, Settings.shortDelay)
  }

  unload () {
    this.term.grabInput(false)
    this.term.fullscreen(false)
  }

  getText () {
    return this.textBuffer.getText()
  }
