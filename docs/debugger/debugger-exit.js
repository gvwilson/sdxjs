import HaltException from './halt-exception.js'
import DebuggerTest from './debugger-test.js'

class DebuggerExit extends DebuggerTest {
  exit (env, lineNum, op, args) {
    throw new HaltException()
  }
}

export default DebuggerExit
