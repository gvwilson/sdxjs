import DebuggerInteractive from './debugger-interactive.js'

class DebuggerTest extends DebuggerInteractive {
  constructor () {
    super()
    this.tester = null
  }

  setTester (tester) {
    this.tester = tester
  }

  input (display) {
    this.tester.fromSystem(display)
    return this.tester.toSystem()
  }

  message (m) {
    this.tester.fromSystem(m)
  }
}

export default DebuggerTest
