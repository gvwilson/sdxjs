import assert from 'assert'
import acorn from 'acorn'
import fs from 'fs'
import path from 'path'
import walk from 'acorn-walk'

class FindAncestors {
  find (dirname, filename, className) {
    return this.traceAncestry(dirname, filename, className, [])
  }

  traceAncestry (dirname, filename, className, accum) {
    const fullPath = path.join(dirname, filename)
    const program = fs.readFileSync(fullPath, 'utf-8')
    const ast = acorn.parse(program, { locations: true })
    const classDef = this.findClassDef(filename, ast, className)
    accum.push({ filename, className, classDef })
    const ancestorName = this.getAncestor(classDef)
    if (ancestorName === null) {
      return accum
    }
    const ancestorFile = this.findRequire(filename, ast, ancestorName)
    return this.traceAncestry(dirname, ancestorFile, ancestorName, accum)
  }

  findClassDef (filename, ast, className) {
    const state = []
    walk.simple(ast, {
      ClassDeclaration: (node, state) => {
        if ((node.id.type === 'Identifier') &&
            (node.id.name === className)) {
          state.push(node)
        }
      }
    }, null, state)
    assert(state.length === 1,
      `No definition for ${className} in ${filename}`)
    return state[0]
  }

  getAncestor (classDef) {
    return (classDef.superClass === null)
      ? null
      : classDef.superClass.name
  }

  findRequire (filename, ast, className) {
    const state = []
    walk.simple(ast, {
      VariableDeclaration: (node, state) => {
        if (node.declarations.length !== 1) {
          return
        }
        const decl = node.declarations[0]
        if ((decl.type !== 'VariableDeclarator') ||
            (decl.id.name !== className)) {
          return
        }
        const init = decl.init
        if ((init.type !== 'CallExpression') ||
            (init.callee.type !== 'Identifier') ||
            (init.callee.name !== 'require') ||
            (init.arguments.length !== 1)) {
          return
        }
        state.push(init.arguments[0].value)
      }
    }, null, state)
    assert(state.length === 1,
      `No require call found for ${className} in ${filename}`)
    return state[0] + '.js'
  }
}

export default FindAncestors
