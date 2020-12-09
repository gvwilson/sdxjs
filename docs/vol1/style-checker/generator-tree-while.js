import getNodes from './generator-tree.js'

const nested = ['first', ['second', 'third']]
const gen = getNodes(nested)
let current = gen.next()
while (!current.done) {
  console.log(current.value)
  current = gen.next()
}
