const assert = require('assert')
const fs = require('fs')
const acorn = require('acorn')

const getDefinitions = (filenames) => {
  return filenames.reduce((map, filename) => {
    const defs = getDefs(filename)
    map.set(filename, defs)
    return map
  }, new Map())
}

const getDefs = (filename) => {
  const options = {locations: true, onComment: []}
  const text = fs.readFileSync(filename)
  const ast = acorn.parse(text, options)
  const comments = options.onComment
        .filter(entry => entry.type === 'Block')
        .map(entry => {
          return {
            value: entry.value,
            start: entry.loc.start.line,
            end: entry.loc.end.line
          }
        })
  const targets = new Set(comments.map(comment => comment.end + 1))
  const fullDefs = []
  findFollowing(ast, targets, fullDefs)
  return fullDefs.map(def => condense(def))
}

const findFollowing = (node, targets, accum) => {
  if ((!node) || (typeof node !== 'object') || (!('type' in node))) {
    return
  }

  if (targets.has(node.loc.start.line)) {
    accum.push(node)
    targets.delete(node.loc.start.line)
  }

  for (let key in node) {
    if (Array.isArray(node[key])) {
      node[key].forEach(child => findFollowing(child, targets, accum))
    }
    else if (typeof node[key] === 'object') {
      findFollowing(node[key], targets, accum)
    }
  }
}

const condense = (node) => {
  const result = {
    type: node.type,
    start: node.loc.start.line
  }
  switch (node.type) {
  case 'VariableDeclaration':
    result.name = node.declarations[0].id.name
    break
  case 'FunctionDeclaration':
    result.name = node.id.name
    break
  case 'ClassDeclaration':
    result.name = node.id.name
    break
  case 'MethodDefinition':
    result.name = node.key.name
    break
  default:
    assert.fail(`Unknown node type ${node.type}`)
    break
  }
  return result
}

module.exports = getDefinitions
