const acorn = require('acorn')
const fs = require('fs')
const walk = require('acorn-walk')

const getRequires = (filename) => {
  const entryPointFile = filename
  const text = fs.readFileSync(entryPointFile)
  const ast = acorn.parse(text)
  const requires = []
  walk.simple(ast, {
    CallExpression: (node, state) => {
      if ((node.callee.type === 'Identifier') &&
          (node.callee.name === 'require')) {
        state.push(node.arguments[0].value)
      }
    }
  }, null, requires)
  return requires
}

if (require.main === module) {
  const result = getRequires(process.argv[2])
  console.log(result)
}
else {
  module.exports = getRequires
}
