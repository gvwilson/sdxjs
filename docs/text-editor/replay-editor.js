const DirtyEditor = require('./dirty-editor')

class ReplayEditor extends DirtyEditor {
  constructor (args) {
    super(args)
    this.isRecording = false
    this.recordedOperations = null
  }

  onKey (key, matches, data) {
    if (this.isRecording) {
      this.recordedOperations.push([key, matches, data])
    }
    super.onKey(key, matches, data)
  }
}

module.exports = ReplayEditor
