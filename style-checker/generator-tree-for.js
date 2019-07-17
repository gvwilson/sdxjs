const getNodes = require('./generator-tree')

const nested = ['first', ['second', 'third']]
for (const value of getNodes(nested)) {
  console.log(value)
}
