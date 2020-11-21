const DebuggerBase = require('./debugger-base')

class DebuggerTrace extends DebuggerBase {
  handle (env, lineNum, op) {
    if (lineNum !== null) {
      console.log(`${lineNum} / ${op}: ${JSON.stringify(env)}`)
    }
  }
}

module.exports = DebuggerTrace
