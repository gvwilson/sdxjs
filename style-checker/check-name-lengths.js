import acorn from 'acorn'
import walk from 'acorn-walk'

const program = `// Constant
const value = 2

// Function
const double = (x) => {
  const y = 2 * x
  return y
}

// Main body
const result = double(value)
console.log(result)
`

// [applyCheck]
const applyCheck = (state, label, node, passes) => {
  if (!passes) {
    if (!(label in state)) {
      state[label] = []
    }
    state[label].push(node)
  }
}
// [/applyCheck]

// [main]
const ast = acorn.parse(program, { locations: true })

const state = {}
walk.simple(ast, {
  Identifier: (node, state) => {
    applyCheck(state, 'name_length', node, node.name.length >= 4)
  }
}, null, state)

state.name_length.forEach(
  node => console.log(`${node.name} at line ${node.loc.start.line}`))
// [/main]
