const fs = require('fs')

const main = () => {
  const algorithm = require(process.argv[2])
  const manifest = JSON.parse(fs.readFileSync(process.argv[3], 'utf-8'))
  console.log(`MANIFEST\n${JSON.stringify(manifest, null, 2)}`)
  const results = algorithm(manifest)
  if (results.length > 0) {
    console.log('RESULTS')
    results.forEach(result => console.log(result))
  } else {
    console.log('NO RESULTS')
  }
}

main()
