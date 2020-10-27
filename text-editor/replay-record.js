const KeyBinding = require('./init-key-binding')

module.exports = new class extends KeyBinding {
  constructor () {
    super('CTRL_R')
  }

  run (editor, key) {
    if (editor.isRecording) {
      editor.isRecording = false
    } else {
      editor.isRecording = true
      editor.recordedOperations = []
    }
  }
}()
