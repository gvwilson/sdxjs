import CoreEditor from './core-operations.js'

export default class UndoEditor extends CoreEditor {
  // <constructor>
  constructor () {
    super()
    this.bindings = this.createDefaultBindings()
    this.stack = []
  }
  // </constructor>

  // <onKey>
  onKey (key, matches, data) {
    if (this.disableUserInteraction && key !== 'CTRL_C') {
      return
    }

    let op = null
    if (key in this.bindings) {
      op = new this.bindings[key](this, key, matches, data)
    } else if (data.isCharacter) {
      op = new KeyCharacter(this, key, matches, data)
    }

    if (op !== null) {
      op.run()
      if (op.save) {
        this.stack.push(op)
      } else if (op.clear) {
        this.stack = []
      }
    }
  }
  // </onKey>

  createDefaultBindings () {
    return {
      BACKSPACE: KeyBackspace,
      CTRL_A: KeySaveAs,
      CTRL_C: KeyExit,
      CTRL_K: KeyCutLine,
      CTRL_O: KeyOpen,
      CTRL_S: KeySaveFile,
      CTRL_U: KeyPasteLine,
      CTRL_X: KeySaveAndExit,
      CTRL_Y: KeyUndo,
      DELETE: KeyDeleteChar,
      DOWN: KeyDown,
      END: KeyEndOfLine,
      ENTER: KeyNewLine,
      HOME: KeyStartOfLine,
      LEFT: KeyLeft,
      PAGE_DOWN: KeyPgDown,
      PAGE_UP: KeyPgUp,
      RIGHT: KeyRight,
      TAB: KeyTab,
      UP: KeyUp
    }
  }
}

// <KeyBase>
class KeyBase {
  constructor (editor, key, matches, data) {
    this.editor = editor
    this.key = key
    this.matches = matches
    this.data = data
    this.configure()
  }

  configure () {
    this.save = false
    this.clear = true
  }

  run () {
    throw new Error('run not implemented')
  }

  undo () {
    throw new Error('undo not implemented')
  }
}
// </KeyBase>

// <KeyCharacter>
class KeyCharacter extends KeyBase {
  configure () {
    this.save = true
  }

  run () {
    this.editor.onCharacter(this.key)
  }

  undo () {
    this.editor.backspace()
  }
}
// </KeyCharacter>

class KeyBackspace extends KeyBase {
  run () {
    this.editor.backspace()
  }
}

class KeySaveAs extends KeyBase {
  configure () {
    this.clear = true
  }

  run () {
    this.editor.saveAs()
  }
}

// <KeyExit>
class KeyExit extends KeyBase {
  configure () {
    this.clear = true
  }

  run () {
    this.editor.exit()
  }
}
// </KeyExit>

class KeyCutLine extends KeyBase {
  run () {
    this.editor.cutLine()
  }
}

class KeyOpen extends KeyBase {
  configure () {
    this.clear = true
  }

  run () {
    this.editor.open()
  }
}

class KeySaveFile extends KeyBase {
  run () {
    this.editor.saveFile()
  }
}

class KeyPasteLine extends KeyBase {
  run () {
    this.editor.pasteLine()
  }
}

class KeyUndo extends KeyBase {
  run () {
    if (this.editor.stack.length > 0) {
      const op = this.editor.stack.pop()
      op.undo()
    }
  }
}

class KeySaveAndExit extends KeyBase {
  run () {
    this.editor.saveAndExit()
  }
}

class KeyDeleteChar extends KeyBase {
  run () {
    this.editor.deleteChar()
  }
}

class KeyDown extends KeyBase {
  configure () {
    this.save = true
  }

  run () {
    this.editor.down()
  }

  undo () {
    this.editor.up()
  }
}

class KeyEndOfLine extends KeyBase {
  run () {
    this.editor.endOfLine()
  }
}

class KeyNewLine extends KeyBase {
  configure () {
    this.save = true
  }

  run () {
    this.editor.newLine()
  }

  undo () {
    this.editor.backspace()
  }
}

class KeyStartOfLine extends KeyBase {
  run () {
    this.editor.startOfLine()
  }
}

class KeyLeft extends KeyBase {
  configure () {
    this.save = true
  }

  run () {
    this.editor.left()
  }

  undo () {
    this.editor.right()
  }
}

class KeyPgDown extends KeyBase {
  configure () {
    this.save = true
  }

  run () {
    this.editor.pgDown()
  }

  undo () {
    this.editor.pgUp()
  }
}

class KeyPgUp extends KeyBase {
  configure () {
    this.save = true
  }

  run () {
    this.editor.pgUp()
  }

  undo () {
    this.editor.pgDown()
  }
}

class KeyRight extends KeyBase {
  configure () {
    this.save = true
  }

  run () {
    this.editor.right()
  }

  undo () {
    this.editor.left()
  }
}

class KeyTab extends KeyBase {
  configure () {
    this.save = true
  }

  run () {
    this.editor.tab()
  }

  undo () {
    this.editor.deleteChar()
  }
}

class KeyUp extends KeyBase {
  configure () {
    this.save = true
  }

  run () {
    this.editor.up()
  }

  undo () {
    this.editor.down()
  }
}
