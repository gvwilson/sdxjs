import fs from 'fs'

const srcDir = process.argv[2]
const results = fs.readdir(srcDir)
for (const name of results) {
  console.log(name)
}
