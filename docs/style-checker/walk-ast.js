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

const options = {
  locations: true,
  onComment: []
}
const ast = acorn.parse(program, options)

const state = []
walk.simple(ast, {
  Identifier: (node, state) => {
    state.push(node)
  }
}, null, state)

state.forEach(node => console.log(
  `identifier ${node.name} on line ${node.loc.start.line}`
))
const comments = options.onComment.map(
  node => node.loc.start.line
).join(', ')
console.log(`comments on lines ${comments}`)
