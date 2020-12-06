import InitEditor from './init-editor.js'

class DirtyEditor extends InitEditor {
  addState (name, initialValue) {
    if (!(name in this)) {
      this[name] = initialValue
    }
  }
}

export default DirtyEditor
