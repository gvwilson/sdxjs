import CoreEditor from './core-operations.js'

export default class LookupEditor extends CoreEditor {
  constructor () {
    super()
    this.bindings = this.createDefaultBindings()
  }

  onKey (key, matches, data) {
    if (this.disableUserInteraction && key !== 'CTRL_C') {
      return
    }
    if (key in this.bindings) {
      this.bindings[key]()
    } else if (data.isCharacter) {
      this.onCharacter(key)
    }
  }

  // <bindings>
  createDefaultBindings () {
    return {
      BACKSPACE: () => this.backspace(),
      CTRL_A: () => this.saveAs(),
      CTRL_C: () => this.exit(),
      CTRL_K: () => this.cutLine(),
      CTRL_O: () => this.open(),
      CTRL_S: () => this.saveFile(),
      CTRL_U: () => this.pasteLine(),
      CTRL_X: () => this.saveAndExit(),
      DELETE: () => this.deleteChar(),
      DOWN: () => this.down(),
      END: () => this.endOfLine(),
      ENTER: () => this.newLine(),
      HOME: () => this.startOfLine(),
      LEFT: () => this.left(),
      PAGE_DOWN: () => this.pgDown(),
      PAGE_UP: () => this.pgUp(),
      RIGHT: () => this.right(),
      TAB: () => this.tab(),
      UP: () => this.up()
    }
  }
  // </bindings>
}
