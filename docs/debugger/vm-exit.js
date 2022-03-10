import HaltException from './halt-exception.js'
import VirtualMachineInteractive from './vm-interactive.js'

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

export default VirtualMachineExit
