import fs from 'fs'
import crypto from 'crypto'

const filename = process.argv[2]
const data = fs.readFileSync(filename, 'utf-8')

const hash = crypto.createHash('sha1').setEncoding('hex')
hash.write(data)
hash.end()
const sha1sum = hash.read()

console.log(`SHA1 of "${filename}" is ${sha1sum}`)
