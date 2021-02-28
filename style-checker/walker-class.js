import acorn from 'acorn'

// [walker]
class Walker {
  // Construct a new AST tree walker.
  constructor (ast) {
    this.ast = ast
  }

  // Walk the tree.
  walk (accumulator) {
    this.stack = []
    this._walk(this.ast, accumulator)
    return accumulator
  }

  // Act on node and then on children.
  _walk (node, accumulator) {
    if (node && (typeof node === 'object') && ('type' in node)) {
      this._doNode(node, accumulator)
      this._doChildren(node, accumulator)
    }
  }

  // Handle a single node by lookup.
  _doNode (node, accumulator) {
    if (node.type in this) {
      this[node.type](node, accumulator)
    }
  }

  // Recurse for anything interesting within the node.
  _doChildren (node, accumulator) {
    this.stack.push(node)
    for (const key in node) {
      if (Array.isArray(node[key])) {
        node[key].forEach(child => {
          this._walk(child, accumulator)
        })
      } else if (typeof node[key] === 'object') {
        this._walk(node[key], accumulator)
      }
    }
    this.stack.pop(node)
  }

  // Is the current node a child of some other type of node?
  _childOf (nodeTypes) {
    return this.stack &&
      nodeTypes.includes(this.stack.slice(-1)[0].type)
  }
}
// [/walker]

// Walk to accumulate variable and parameter definitions.
class VariableWalker extends Walker {
  Identifier (node, accumulator) {
    if (this._childOf(['ArrowFunctionExpression',
      'VariableDeclarator'])) {
      accumulator.push(node.name)
    }
  }
}

// Test.
const program = `const value = 2

const double = (x) => {
  const y = 2 * x
  return y
}

const result = double(value)
console.log(result)
`

const ast = acorn.parse(program, { locations: true })
const walker = new VariableWalker(ast)
const accumulator = []
walker.walk(accumulator)
console.log('definitions are', accumulator)
