import getNodes from './generator-tree.js'

const nested = ['first', ['second', 'third']]
for (const value of getNodes(nested)) {
  console.log(value)
}
