import KeyBinding from './init-key-binding.js'

module.exports = new class extends KeyBinding {
  constructor () {
    super('CTRL_P')
  }

  run (editor, key) {
    if (editor.isRecording) {
      editor.isRecording = false
      editor.recordedOperations.pop() // to get rid of this command
    }
    if (editor.recordedOperations) {
      editor.recordedOperations.forEach(op => editor.onKey(...op))
    }
  }
}()
