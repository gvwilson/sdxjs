const BuilderClass = require(process.argv[2])
const builder = new BuilderClass(process.argv[3])
builder.build()
