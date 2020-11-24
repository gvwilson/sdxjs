import acorn from 'acorn'

const program = `const value = 2

const double = (x) => {
  const y = 2 * x
  return y
}

const result = double(value)
console.log(result)
`

const ast = acorn.parse(program, { locations: true })
console.log(JSON.stringify(ast, null, 2))
