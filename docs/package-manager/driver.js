import fs from 'fs'

const main = () => {
  const algorithm = require(process.argv[2])
  const manifest = JSON.parse(fs.readFileSync(process.argv[3], 'utf-8'))
  algorithm(manifest)
}

main()
