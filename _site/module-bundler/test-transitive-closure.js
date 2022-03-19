import transitiveClosure from './transitive-closure.js'

const result = transitiveClosure(process.argv[2])
console.log(JSON.stringify(result, null, 2))
