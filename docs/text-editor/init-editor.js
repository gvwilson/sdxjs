const fs = require('fs')
const yaml = require('js-yaml')

const MinimalEditor = require('./minimal-editor')

class InitEditor extends MinimalEditor {
  constructor (args) {
    super(args.slice(1))
    this.defaultBinding = null
    this.bindings = new Map()
    this.loadBindings(args[0])
  }

  loadBindings (filename) {
    const allNames = yaml.safeLoad(fs.readFileSync(filename, 'utf-8'))
    allNames.forEach(name => {
      const binding = require(`./${name}`)
      binding.init(this)
      if (binding.isDefault) {
        if (this.defaultBinding !== null) {
          throw new Error('can only have one handler for default binding')
        }
        this.defaultBinding = binding
      } else {
        this.bindings.set(binding.key, binding)
      }
    })
  }

  onKey (key, matches, data) {
    if (this.bindings.has(key)) {
      this.bindings.get(key).run(this, key)
    } else if (data.isCharacter) {
      this.defaultBinding.run(this, key)
    }
  }
}

module.exports = InitEditor
