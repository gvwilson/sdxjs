import fs from 'fs'
import crypto from 'crypto'

const filename = process.argv[2]
const hash = crypto.createHash('sha1').setEncoding('hex')
fs.createReadStream(filename).pipe(hash)
hash.on('finish', () => {
  const final = hash.read()
  console.log('final', final)
})
console.log('program ends')
