import acorn from 'acorn'
import fs from 'fs'
import walk from 'acorn-walk'

const getRequires = (filename) => {
  const entryPointFile = filename
  const text = fs.readFileSync(entryPointFile, 'utf-8')
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

export default getRequires
