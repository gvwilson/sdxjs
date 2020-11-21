const HaltException = require('./halt-exception')
const DebuggerTest = require('./debugger-test')

class DebuggerExit extends DebuggerTest {
  exit (env, lineNum, op, args) {
    throw new HaltException()
  }
}

module.exports = DebuggerExit
