import assert from 'assert'

class VirtualMachineBase {
  constructor (program) {
    this.program = this.compile(program)
    this.prefix = '>>'
  }

  compile (lines) {
    const text = lines
      .map(line => line.trim())
      .filter(line => (line.length > 0) && !line.startsWith('//'))
      .join('\n')
    return JSON.parse(text)
  }

  run () {
    this.env = {}
    this.runAll(this.program)
  }

  runAll (commands) {
    commands.forEach(command => this.exec(command))
  }

  exec (command) {
    const [op, ...args] = command
    assert(op in this,
      `Unknown op "${op}"`)
    return this[op](args)
  }

  // [skip]
  // [add]
  add (args) {
    this.checkOp('add', 2, args)
    const left = this.exec(args[0])
    const right = this.exec(args[1])
    return left + right
  }
  // [/add]

  append (args) {
    this.checkOp('append', 2, args)
    this.checkArray('append', args[0])
    const val = this.exec(args[1])
    this.env[args[0]].push(val)
  }

  data (args) {
    return args
  }

  defA (args) {
    this.checkOp('defA', 2, args)
    const [name, data] = args
    this.env[name] = this.exec(data)
  }

  // [defV]
  defV (args) {
    this.checkOp('defV', 2, args)
    const [name, value] = args
    this.env[name] = this.exec(value)
  }
  // [/defV]

  getA (args) {
    this.checkOp('getA', 2, args)
    this.checkArray('getA', args[0])
    const index = this.exec(args[1])
    this.checkIndex('getA', args[0], index)
    return this.env[args[0]][index]
  }

  getV (args) {
    this.checkOp('getV', 1, args)
    this.checkName('getV', args[0])
    return this.env[args[0]]
  }

  gt (args) {
    this.checkOp('gt', 2, args)
    const left = this.exec(args[0])
    const right = this.exec(args[1])
    return left > right
  }

  len (args) {
    this.checkOp('len', 1, args)
    this.checkArray('len', args[0])
    return this.env[args[0]].length
  }

  lt (args) {
    this.checkOp('lt', 2, args)
    const left = this.exec(args[0])
    const right = this.exec(args[1])
    return left < right
  }

  // [loop]
  loop (args) {
    this.checkBody('loop', 1, args)
    const body = args.slice(1)
    while (this.exec(args[0])) {
      this.runAll(body)
    }
  }
  // [/loop]

  num (args) {
    this.checkOp('num', 1, args)
    assert(typeof args[0] === 'number',
      `Non-numeric value for "num": "${args[0]}"`)
    return args[0]
  }

  print (args) {
    this.checkOp('print', 1, args)
    const val = this.exec(args[0])
    this.message(this.prefix, val)
  }

  setA (args) {
    this.checkOp('setA', 3, args)
    this.checkArray('setA', args[0])
    const index = this.exec(args[1])
    this.checkIndex('setA', args[0], index)
    const value = this.exec(args[2])
    this.env[args[0]][index] = value
  }

  setV (args) {
    this.checkOp('setV', 2, args)
    this.checkName('setV', args[0])
    this.env[args[0]] = this.exec(args[1])
  }

  test (args) {
    this.checkBody('test', 1, args)
    const condition = this.exec(args[0])
    if (condition) {
      const body = args.slice(1)
      this.runAll(body)
    }
  }

  // [checkArray]
  checkArray (op, name) {
    this.checkName(op, name)
    const array = this.env[name]
    assert(Array.isArray(array),
      `Variable "${name}" used in "${op}" is not array`)
  }
  // [/checkArray]

  checkBody (op, minimum, args) {
    assert(args.length >= minimum,
      `Badly-formatted operation ${op}: ${JSON.stringify(args)}`)
  }

  checkIndex (op, name, index) {
    this.checkArray(op, name)
    assert((0 <= index) && (index < this.env[name].length),
      `Index "${index}" out of bounds for array "${name}"`)
  }

  checkName (op, name) {
    assert(name in this.env,
      `Unknown name "${name}" for operation "${op}"`)
  }

  checkOp (op, expected, args) {
    assert(args.length === expected,
      `Badly-formatted operation ${op}: ${JSON.stringify(args)}`)
  }

  message (prefix, val) {
    console.log(prefix, val)
  }
  // [/skip]
}

export default VirtualMachineBase
