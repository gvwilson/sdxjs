import KeyBinding from './init-key-binding.js'

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
