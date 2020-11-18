const assert = require('assert')

const {
  OPS,
  OP_SHIFT,
  OP_WIDTH,
  NUM_REG
} = require('./architecture')

// <assemble>
const assemble = (lines) => {
  lines = lines
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter(line => !isComment(line))
  const labels = findLabels(lines)
  const instructions = lines.filter(line => !isLabel(line))
  const compiled = instructions.map(instr => compile(instr, labels))
  const program = instructionsToText(compiled)
  return program
}

const isComment = (line) => {
  return line.startsWith('#')
}
// </assemble>

// <find-labels>
const findLabels = (lines) => {
  const result = {}
  let index = 0
  lines.forEach(line => {
    if (isLabel(line)) {
      const label = line.slice(0, -1)
      assert(!(label in result),
        `Duplicate label ${label}`)
      result[label] = index
    } else {
      index += 1
    }
  })
  return result
}

const isLabel = (line) => {
  return line.endsWith(':')
}
// </find-labels>

// <compile>
const compile = (instruction, labels) => {
  const [op, ...args] = instruction.split(/\s+/)
  let result = 0
  switch (OPS[op].fmt) {
    case '--':
      result = combine(OPS[op].code)
      break
    case 'r-':
      result = combine(register(args[0]), OPS[op].code)
      break
    case 'rr':
      result = combine(register(args[1]), register(args[0]), OPS[op].code)
      break
    case 'rv':
      result = combine(value(args[1], labels), register(args[0]), OPS[op].code)
      break
    default:
      assert(false,
        `Unknown instruction format ${OPS[op].fmt}`)
  }
  return result
}
// </compile>

// <combine>
const combine = (...args) => {
  assert(args.length > 0,
    'Cannot combine no arguments')
  let result = 0
  for (const a of args) {
    result <<= OP_SHIFT
    result |= a
  }
  return result
}
// </combine>

// <utilities>
const instructionsToText = (program) => {
  return program.map(op => op.toString(16).padStart(OP_WIDTH, '0'))
}

const register = (token) => {
  assert(token[0] === 'R',
    `Register "${token}" does not start with 'R'`)
  const r = parseInt(token.slice(1))
  assert((0 <= r) && (r < NUM_REG),
    `Illegal register ${token}`)
  return r
}

const value = (token, labels) => {
  if (token[0] !== '@') {
    return parseInt(token)
  }
  const labelName = token.slice(1)
  assert(labelName in labels,
    `Unknown label "${token}"`)
  return labels[labelName]
}
// </utilities>

module.exports = assemble
