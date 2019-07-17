const acorn = require('acorn')

const text = `const func = (param) => {
  return param + 1
}`

const ast = acorn.parse(text)
console.log(JSON.stringify(ast, null, space=2))
