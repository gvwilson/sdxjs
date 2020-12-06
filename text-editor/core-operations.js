import fs from 'fs'

import BaseEditor from './base-editor.js'

const MEDIUM_DELAY = 2000
const LONG_DELAY = 3500

export default class CoreEditor extends BaseEditor {
  constructor () {
    super()
    this.mediumDelay = MEDIUM_DELAY
    this.longDelay = LONG_DELAY
  }

  // <onKey>
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
      // <skip>
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
      case 'DELETE':
        this.deleteChar()
        break
      // </skip>
      case 'BACKSPACE':
        this.backspace()
        break
      case 'ENTER':
        this.newLine()
        break
      default:
        if (data.isCharacter) {
          this.onCharacter(key)
        }
        break
    }
  }
  // </onKey>

  onCharacter (key) {
    this.fileIsModified = true
    this.textBuffer.insert(key)
    this.draw()
  }

  open () {
    this.getFileNameFromUser('Open file: ', file => this.load(file))
  }

  load (file) {
    let content = ''
    this.disableUserInteraction = true
    try {
      if (fs.existsSync(file)) {
        content = fs.readFileSync(file, 'utf8')
      }
      this.currentFile = file
    } catch (e) {
      this.drawStatusBar('ERROR: Failed to load file: ' + file, this.longDelay)
    }

    this.textBuffer.moveTo(0, 0)
    this.textBuffer.setText('')
    this.textBuffer.insert(content)
    this.textBuffer.moveTo(0, 0)
    this.fileIsModified = false
    this.disableUserInteraction = false
    this.draw()
  }

  // <save>
  saveFile () {
    if (!this.fileIsModified) {
      return
    }

    if (this.getText() === '') {
      return
    }

    if (this.currentFile) {
      this.save(this.currentFile)
    } else {
      this.saveAs()
    }
  }

  save (file, callback = () => {}) {
    this.disableUserInteraction = true
    try {
      fs.writeFileSync(file, this.getText())
      this.fileIsModified = false
      this.currentFile = file
      this.drawStatusBar('Saved!', this.mediumDelay)
      this.disableUserInteraction = false
      callback()
    } catch (e) {
      this.disableUserInteraction = false
      callback(e)
    }
  }

  saveAs (callback) {
    this.getFileNameFromUser('Save as: ',
      file => this.save(file, callback),
      this.currentFile)
  }
  // </save>

  getFileNameFromUser (prompt, callback, prefill = '') {
    this.disableUserInteraction = true

    this.drawPrompt(prompt)
    const fileOptions = {
      cancelable: true,
      default: prefill
    }
    this.term.fileInput(fileOptions, (err, file) => {
      this.disableUserInteraction = false
      this.drawStatusBar()
      if (err) {
        this.drawStatusBar('An error occurred.', this.longDelay)
        callback(err)
        return
      }
      if (!file) {
        return
      }
      callback(file)
    })
  }

  saveAndExit () {
    this.saveAs(err => {
      if (err) {
        this.drawStatusBar('ERR: Could not save file. Hit Ctrl + C to force exit.',
          this.longDelay)
        return
      }
      this.exit()
    })
  }

  exit () {
    setTimeout(() => {
      this.term.grabInput(false)
      this.term.fullscreen(false)
      setTimeout(() => process.exit(0), this.shortDelay)
    }, this.shortDelay)
  }

  up () {
    this.textBuffer.moveUp()
    if (this.textBuffer.cx > this.textBuffer.buffer[this.textBuffer.cy].length - 1) {
      this.textBuffer.moveToEndOfLine()
    }
    this.drawCursor()
  }

  down () {
    if (this.textBuffer.getContentSize().height - 1 > this.textBuffer.cy) {
      this.textBuffer.moveDown()
      if (this.textBuffer.cx > this.textBuffer.buffer[this.textBuffer.cy].length - 1) {
        this.textBuffer.moveToEndOfLine()
      }
      this.drawCursor()
    }
  }

  left () {
    this.textBuffer.moveBackward()
    this.drawCursor()
  }

  right () {
    if (this.textBuffer.cx < this.getLine().length) {
      this.textBuffer.moveRight()
    } else if (this.textBuffer.getContentSize().height - 1 > this.textBuffer.cy) {
      this.textBuffer.moveTo(0, this.textBuffer.cy + 1)
    }
    this.drawCursor()
  }

  getLine () {
    return this.textBuffer.buffer[this.textBuffer.cy].reduce((acc, curr) => {
      acc += curr.char.trim()
      return acc
    }, '')
  }

  startOfLine () {
    this.textBuffer.moveToColumn(0)
    this.drawCursor()
  }

  endOfLine () {
    this.textBuffer.moveToEndOfLine()
    this.drawCursor()
  }

  pgUp () {
    this.textBuffer.cy = Math.max(0, this.textBuffer.cy - Math.floor(this.screenBuffer.height / 2))
    this.draw()
  }

  pgDown () {
    this.textBuffer.cy = Math.min(this.textBuffer.getContentSize().height - 1,
      this.textBuffer.cy + Math.floor(this.screenBuffer.height / 2))
    this.draw()
  }

  deleteChar () {
    this.fileIsModified = true
    this.textBuffer.delete(1)
    this.draw()
  }

  backspace () {
    this.fileIsModified = true
    this.textBuffer.backDelete(1)
    this.draw()
  }

  newLine () {
    this.fileIsModified = true
    this.textBuffer.newLine()
    this.draw()
  }

  tab () {
    this.fileIsModified = true
    this.textBuffer.insert('\t')
    this.draw()
  }

  cutLine () {
    this.lineCutBuffer = this.textBuffer.buffer[this.textBuffer.cy]
    if (this.textBuffer.cy === 0 && this.textBuffer.buffer.length === 1) {
      this.textBuffer.buffer[0] = []
      this.textBuffer.moveToEndOfLine()
    } else {
      if (this.textBuffer.cy === this.textBuffer.buffer.length - 1) {
        this.textBuffer.buffer.splice(this.textBuffer.cy, 1, [])
      } else {
        this.textBuffer.buffer.splice(this.textBuffer.cy, 1)
      }
      if (this.textBuffer.cx >= this.textBuffer.buffer[this.textBuffer.cy].length) {
        this.textBuffer.moveToEndOfLine()
      }
    }
    this.fileIsModified = true
    this.draw()
  }

  pasteLine () {
    if (this.lineCutBuffer) {
      this.fileIsModified = true
      this.textBuffer.buffer.splice(this.textBuffer.cy, 0, this.lineCutBuffer)
      this.textBuffer.moveDown()
      this.draw()
    }
  }

  getText () {
    return this.textBuffer.getText()
  }
}
