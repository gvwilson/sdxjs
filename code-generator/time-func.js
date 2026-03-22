import acorn from 'acorn'
import walk from 'acorn-walk'
import escodegen from 'escodegen'

// [timeFunc]
const timeFunc = (text) => {
  const ast = acorn.parse(text, { sourceType: 'module' })
  const allNodes = gatherNodes(ast)
  allNodes.forEach(node => wrapFuncDef(node))
  return [
    initializeCounters(allNodes),
    escodegen.generate(ast),
    reportCounters()
  ].join('\n')
}
// [/timeFunc]

// [gatherNodes]
const gatherNodes = (ast) => {
  const allNodes = []
  walk.simple(ast, {
    VariableDeclarator: (node, state) => {
      if (node.init && (node.init.type === 'ArrowFunctionExpression')) {
        state.push(node)
      }
    }
  }, null, allNodes)
  return allNodes
}
// [/gatherNodes]

// [wrapFuncDef]
const wrapFuncDef = (originalAst) => {
  const name = originalAst.id.name
  const wrapperAst = makeWrapperAst(name)
  wrapperAst.init.body.body[0].declarations[0].init = originalAst.init
  originalAst.init = wrapperAst.init
}
// [/wrapFuncDef]

// [makeWrapper]
const makeWrapperAst = (name) => {
  const template = `const ${name} = (...originalArgs) => {
    const originalFunc = () => {}
    const startTime = Date.now()
    try {
      const result = originalFunc(...originalArgs)
      const endTime = Date.now()
      __counters['${name}'] += endTime - startTime
      return result
    } catch (error) {
      const endTime = Date.now()
      __counters['${name}'] += endTime - startTime
      throw error
    }
  }`
  return acorn.parse(template, { sourceType: 'module' })
    .body[0]
    .declarations[0]
}
// [/makeWrapper]

// [admin]
const initializeCounters = (nodes) => {
  const body = nodes.map(n => `'${n.id.name}': 0`).join(',\n')
  return 'const __counters = {\n' + body + '\n}'
}

const reportCounters = () => {
  return 'console.log(__counters)'
}
// [/admin]

export default timeFunc
