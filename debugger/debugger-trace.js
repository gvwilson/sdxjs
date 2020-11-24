import DebuggerBase from './debugger-base.js'

class DebuggerTrace extends DebuggerBase {
  handle (env, lineNum, op) {
    if (lineNum !== null) {
      console.log(`${lineNum} / ${op}: ${JSON.stringify(env)}`)
    }
  }
}

export default DebuggerTrace
