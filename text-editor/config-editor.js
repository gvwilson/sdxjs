import fs from 'fs'
import yaml from 'js-yaml'

import MinimalEditor from './minimal-editor.js'

class ConfigEditor extends MinimalEditor {
  constructor (args) {
    super(args.slice(1))
    this.bindings = new Map()
    this.loadBindings(args[0])
  }

  loadBindings (filename) {
    const allNames = yaml.safeLoad(fs.readFileSync(filename, 'utf-8'))
    allNames.forEach(name => {
      const binding = require(`./${name}`)
      this.bindings.set(binding.key, binding)
    })
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

export default ConfigEditor
