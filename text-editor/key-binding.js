class KeyBinding {
  constructor (key) {
    this.key = key
  }

  run (editor, key) {
    throw new Error('key binding classes must implement run method')
  }
}

module.exports = KeyBinding
