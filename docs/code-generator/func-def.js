import acorn from 'acorn.js'

const text = `const func = (param) => {
  return param + 1
}`

const ast = acorn.parse(text)
console.log(JSON.stringify(ast, null, 2))
