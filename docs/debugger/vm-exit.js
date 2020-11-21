const HaltException = require('./halt-exception')
const VirtualMachineInteractive = require('./vm-interactive')

class VirtualMachineExit extends VirtualMachineInteractive {
  run () {
    this.env = {}
    try {
      this.runAll(this.program)
    } catch (exc) {
      if (exc instanceof HaltException) {
        return
      }
      throw exc
    }
  }
}

module.exports = VirtualMachineExit
