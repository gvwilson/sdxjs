const transitiveClosure = require('./transitive-closure-only')

const result = transitiveClosure(process.argv[2])
console.log(JSON.stringify(result, null, 2))
