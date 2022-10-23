import acorn from 'acorn'
const ast = acorn.parse('const x = 0', { locations: true })
console.log(JSON.stringify(ast, null, 2))
