const BuilderClass = require(process.argv[2])
const builder = new BuilderClass(...process.argv.slice(3))
builder.build()
