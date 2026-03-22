import prompt from 'prompt-sync'

import DebuggerBase from './debugger-base.js'

const PROMPT_OPTIONS = { sigint: true }

class DebuggerInteractive extends DebuggerBase {
  constructor () {
    super()
    this.singleStep = true
    this.breakpoints = new Set()
    this.lookup = {
      '?': 'help',
      c: 'clear',
      l: 'list',
      n: 'next',
      p: 'print',
      r: 'run',
      s: 'stop',
      v: 'variables',
      x: 'exit'
    }
  }

  handle (env, lineNum, op) {
    if (lineNum === null) {
      return
    }
    if (this.singleStep) {
      this.singleStep = false
      this.interact(env, lineNum, op)
    } else if (this.breakpoints.has(lineNum)) {
      this.interact(env, lineNum, op)
    }
  }

  // [skip]
  // [interact]
  interact (env, lineNum, op) {
    let interacting = true
    while (interacting) {
      const command = this.getCommand(env, lineNum, op)
      if (command.length === 0) {
        continue
      }
      const [cmd, ...args] = command
      if (cmd in this) {
        interacting = this[cmd](env, lineNum, op, args)
      } else if (cmd in this.lookup) {
        interacting = this[this.lookup[cmd]](env, lineNum, op, args)
      } else {
        this.message(`unknown command ${command} (use '?' for help)`)
      }
    }
  }

  getCommand (env, lineNum, op) {
    const options = Object.keys(this.lookup).sort().join('')
    const display = `[${lineNum} ${options}] `
    return this.input(display)
      .split(/\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }

  input (display) {
    return prompt(PROMPT_OPTIONS)(display)
  }
  // [/interact]

  help (env, lineNum, op, args) {
    this.message(this.lookup)
    return true
  }

  clear (env, lineNum, op, args) {
    if (args.length !== 1) {
      this.message('c[lear] requires one line number')
    } else {
      this.breakpoints.delete(parseInt(args[0]))
    }
    return true
  }

  list (env, lineNum, op, args) {
    const msg = Object.keys(this.vm.sourceMap)
      .map(n => parseInt(n))
      .sort((left, right) => left - right)
      .map(n => {
        if (this.breakpoints.has(n)) {
          return `${n}*`
        } else {
          return `${n}`
        }
      })
      .join(' ')
    this.message(msg)
    return true
  }

  // [next]
  next (env, lineNum, op, args) {
    this.singleStep = true
    return false
  }
  // [/next]

  // [print]
  print (env, lineNum, op, args) {
    if (args.length !== 1) {
      this.message('p[rint] requires one variable name')
    } else if (!(args[0] in env)) {
      this.message(`unknown variable name "${args[0]}"`)
    } else {
      this.message(JSON.stringify(env[args[0]]))
    }
    return true
  }
  // [/print]

  run (env, lineNum, op, args) {
    this.singleStep = false
    return false
  }

  stop (env, lineNum, op, args) {
    if (args.length !== 1) {
      this.message('s[top] requires one line number')
    } else {
      this.breakpoints.add(parseInt(args[0]))
    }
    return true
  }

  variables (env, lineNum, op, args) {
    this.message(Object.keys(env).sort())
    return true
  }

  exit (env, lineNum, op, args) {
    process.exit(0)
  }
  // [/skip]
}

export default DebuggerInteractive
