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
    const options = { locations: true, sourceType: 'module' }
    const ast = acorn.parse(program, options)
    const classDef = this.findClassDef(filename, ast, className)
    accum.push({ filename, className, classDef })
    const ancestorName = this.getAncestor(classDef)
    if (ancestorName === null) {
      return accum
    }
    const ancestorFile = this.findImport(filename, ast, ancestorName)
    return this.traceAncestry(dirname, ancestorFile, ancestorName, accum)
  }

  // [skip]
  // [findClassDef]
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
  // [/findClassDef]

  getAncestor (classDef) {
    return (classDef.superClass === null)
      ? null
      : classDef.superClass.name
  }

  findImport (filename, ast, className) {
    const state = []
    walk.simple(ast, {
      ImportDeclaration: (node, state) => {
        if (node.specifiers.length !== 1) {
          return
        }
        const spec = node.specifiers[0]
        if ((spec.type !== 'ImportDefaultSpecifier') ||
            (!('local' in spec)) ||
            (spec.local.type !== 'Identifier')) {
          return
        }
        if (spec.local.name !== className) {
          return
        }
        state.push(node.source.value)
      }
    }, null, state)
    assert(state.length === 1,
      `No import found for ${className} in ${filename}`)
    return state[0]
  }
  // [/skip]
}

export default FindAncestors
