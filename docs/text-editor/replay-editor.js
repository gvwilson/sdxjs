import PluginEditor from './plugin-editor.js'

export default class ReplayEditor extends PluginEditor {
  // <constructor>
  constructor () {
    super()
    this.isRecording = false
    this.recorded = []
    this.bindings.CTRL_P =
      (editor, key, matches, data) => this.playback()
    this.bindings.CTRL_R =
      (editor, key, matches, data) => this.record()
  }
  // </constructor>

  // <onKey>
  onKey (key, matches, data) {
    if (this.isRecording) {
      this.recorded.push([key, matches, data])
    }
    super.onKey(key, matches, data)
  }
  // </onKey>

  // <record>
  record () {
    if (this.isRecording) {
      this.isRecording = false
      this.recorded.pop() // to get rid of this command
    } else {
      this.isRecording = true
      this.recorded = []
    }
  }
  // </record>

  // <playback>
  playback () {
    if (this.isRecording) {
      this.isRecording = false
      this.recorded.pop() // to get rid of this command
    }
    if (this.recorded.length > 0) {
      this.recorded.forEach(op => this.onKey(...op))
    }
  }
  // </playback>
}
