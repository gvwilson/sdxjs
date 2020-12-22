import acorn from 'acorn'
import walk from 'acorn-walk'
import escodegen from 'escodegen'

const text = `
const funcOuter = (param) => {
  return param + 1
}
const funcInner = (param) => {
  return param + 1
}
for (const i of [1, 3, 5]) {
  funcOuter(funcInner(i) + funcInner(i))
}
`

const main = () => {
  const ast = acorn.parse(text, { sourceType: 'module' })

  const allNodes = []
  walk.simple(ast, {
    VariableDeclarator: (node, state) => {
      if (node.init && (node.init.type === 'ArrowFunctionExpression')) {
        state.push(node)
      }
    }
  }, null, allNodes)

  const names = {}
  allNodes.forEach(node => insertCounter(names, node))
  console.log(initializeCounters(names))
  console.log(escodegen.generate(ast))
  console.log(reportCounters())
}

const insertCounter = (names, node) => {
  const name = node.id.name
  names[name] = 0

  const body = node.init.body.body
  const increment =
    acorn.parse(`__counters['${name}'] += 1`, { sourceType: 'module' })
  body.unshift(increment)
}

const initializeCounters = (names) => {
  const body = Object.keys(names).map(n => `'${n}': 0`).join(',\n')
  return 'const __counters = {\n' + body + '\n}'
}

const reportCounters = () => {
  return 'console.log(__counters)'
}

main()
