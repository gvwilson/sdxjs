const hashExisting = require('./hash-existing-promise')

const root = process.argv[2]
hashExisting(root).then(pairs => pairs.forEach(
  ([path, hash]) => console.log(path, hash)
))
