import assert from 'assert'

class DebuggerBase {
  constructor () {
    this.vm = null
  }

  setVM (vm) {
    assert(vm !== null,
      'Debugger requires a virtual machine')
    this.vm = vm
  }

  message (text) {
    console.log(text)
  }
}

export default DebuggerBase
