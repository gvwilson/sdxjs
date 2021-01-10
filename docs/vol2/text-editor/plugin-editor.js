import fs from 'fs'
import yaml from 'js-yaml'

import LookupOperations from './lookup-editor.js'

const EDITOR_CONFIG = 'editor-config.yml'

export default class PluginEditor extends LookupEditor {
  constructor () {
    super()
    this.loadPlugins()
  }

  async loadPlugins () {
    if (fs.existsSync(EDITOR_CONFIG)) {
      const config = yaml.safeLoad(fs.readFileSync(EDITOR_CONFIG, 'utf-8'))
      const plugins = await Promise.all(config.map(entry => import(entry.filename)))
      config.forEach((entry, i) => {
        const key = entry.key
        const func = plugins[i].default
        this.bindings[key] = func
      })
    }
  }

  // <skip>
  onKey (key, matches, data) {
    if (this.disableUserInteraction && key !== 'CTRL_C') {
      return
    }
    if (key in this.bindings) {
      this.bindings[key](this, key, matches, data)
    } else if (data.isCharacter) {
      this.onCharacter(key)
    }
  }

  createDefaultBindings () {
    return {
      BACKSPACE: (editor, key, matches, data) => this.backspace(),
      CTRL_A: (editor, key, matches, data) => this.saveAs(),
      CTRL_C: (editor, key, matches, data) => this.exit(),
      CTRL_K: (editor, key, matches, data) => this.cutLine(),
      CTRL_O: (editor, key, matches, data) => this.open(),
      CTRL_S: (editor, key, matches, data) => this.saveFile(),
      CTRL_U: (editor, key, matches, data) => this.pasteLine(),
      CTRL_X: (editor, key, matches, data) => this.saveAndExit(),
      DELETE: (editor, key, matches, data) => this.deleteChar(),
      DOWN: (editor, key, matches, data) => this.down(),
      END: (editor, key, matches, data) => this.endOfLine(),
      ENTER: (editor, key, matches, data) => this.newLine(),
      HOME: (editor, key, matches, data) => this.startOfLine(),
      LEFT: (editor, key, matches, data) => this.left(),
      PAGE_DOWN: (editor, key, matches, data) => this.pgDown(),
      PAGE_UP: (editor, key, matches, data) => this.pgUp(),
      RIGHT: (editor, key, matches, data) => this.right(),
      TAB: (editor, key, matches, data) => this.tab(),
      UP: (editor, key, matches, data) => this.up()
    }
  }
  // </skip>
}
