import acorn from 'acorn'

// Test.
const program = `const value = 2

const double = (x) => {
  const y = 2 * x
  return 2 * y + 1
}

const result = double(value)
console.log(result)
`

// [generator]
function * getNodes (node) {
  if (node && (typeof node === 'object') && ('type' in node)) {
    yield node
    for (const key in node) {
      if (Array.isArray(node[key])) {
        for (const child of node[key]) {
          yield * getNodes(child)
        }
      } else if (typeof node[key] === 'object') {
        yield * getNodes(node[key])
      }
    }
  }
}
// [/generator]

// [main]
const ast = acorn.parse(program, { locations: true })
const result = {}
for (const node of getNodes(ast)) {
  if (node.type === 'BinaryExpression') {
    if (node.operator in result) {
      result[node.operator] += 1
    } else {
      result[node.operator] = 1
    }
  }
}
console.log('counts are', result)
// [/main]
