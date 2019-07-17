  getFileNameFromUser (prompt, callback, prefill = '') {
    this.disableUserInteraction = true

    this.drawPrompt(prompt)
    const fileOptions = {
      cancelable: true,
      default: prefill
    }
    this.term.fileInput(fileOptions, (err, file) => {
      this.disableUserInteraction = false
      this.drawStatusBar()
      if (err) {
        this.drawStatusBar('An error occurred.', Settings.longDelay)
        callback(err)
        return
      }
      if (!file) {
        return
      }
      callback(file)
    })
  }
