const main = async () => {
  const BuilderClass = (await import(process.argv[2])).default
  const builder = new BuilderClass(...process.argv.slice(3))
  try {
    builder.build()
  } catch (err) {
    console.error('Build failed:', err)
  }
}

main()
