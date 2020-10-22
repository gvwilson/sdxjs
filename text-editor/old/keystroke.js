  onKey (key, matches, data) {
    if (this.disableUserInteraction && key !== 'CTRL_C') {
      return
    }

    switch (key) {
    case 'CTRL_C':
      this.exit()
      break
    case 'CTRL_X':
      this.saveAndExit()
      break
    case 'CTRL_S':
      this.saveFile()
      break
    case 'CTRL_A':
      this.saveAs()
      break
    case 'CTRL_O':
      this.open()
      break
    case 'CTRL_K':
      this.cutLine()
      break
    case 'CTRL_U':
      this.pasteLine()
      break
    case 'PAGE_UP':
      this.pgUp()
      break
    case 'PAGE_DOWN':
      this.pgDown()
      break
    case 'UP':
      this.up()
      break
    case 'DOWN':
      this.down()
      break
    case 'LEFT':
      this.left()
      break
    case 'RIGHT':
      this.right()
      break
    case 'HOME':
      this.startOfLine()
      break
    case 'END':
      this.endOfLine()
      break
    case 'TAB':
      this.tab()
      break
    case 'CTRL_HOME':
      this.startOfText()
      break
    case 'CTRL_END':
      this.endOfText()
      break
    case 'DELETE':
      this.deleteChar()
      break
    case 'BACKSPACE':
      this.backspace()
      break
    case 'ENTER':
      this.newLine()
      break
    default:
      if (data.isCharacter) {
        this.fileIsModified = true
        this.textBuffer.insert(key)
        this.draw()
      }
      break
    }
  }
