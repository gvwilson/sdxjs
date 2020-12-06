import MinimalEditor from './minimal-editor.js'

// <bindings>
// <enter-binding>
import KeyBinding from './simple-key-binding.js'

class EnterBinding extends KeyBinding {
  constructor () {
    super('ENTER')
  }

  run (editor, key) {
    editor.newLine()
  }
}

const ENTER_BINDING = new EnterBinding()
// </enter-binding>

// <exit-binding>
const EXIT_BINDING = new class extends KeyBinding {
  constructor () {
    super('CTRL_C')
  }

  run (editor, key) {
    editor.exit()
  }
}()
// </exit-binding>
// </bindings>

class BindingsEditor extends MinimalEditor {
  constructor (args) {
    super(args)
    this.bindings = new Map()
    this.bindings.set(ENTER_BINDING.key, ENTER_BINDING)
    this.bindings.set(EXIT_BINDING.key, EXIT_BINDING)
  }

  onKey (key, matches, data) {
    if (this.bindings.has(key)) {
      this.bindings.get(key).run(this, key)
    } else if (data.isCharacter) {
      this.textBuffer.insert(key)
      this.draw()
    }
  }
}

export default BindingsEditor
