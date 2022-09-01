import acorn from 'acorn'

const text = `const func = (param) => {
  return param + 1
}`

const ast = acorn.parse(text, { sourceType: 'module' })
console.log(JSON.stringify(ast, null, 2))
