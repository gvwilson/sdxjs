import fs from 'fs'

const main = async () => {
  const algorithm = (await import(process.argv[2])).default
  const manifest = JSON.parse(fs.readFileSync(process.argv[3], 'utf-8'))
  algorithm(manifest)
}

main()
