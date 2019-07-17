const hashExisting = require('./hash-existing-async')

const root = process.argv[2]
hashExisting(root)
  .then(pairs => pairs.forEach(([path, hash]) => console.log(path, hash)))
