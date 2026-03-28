import crypto from 'crypto'

// create a SHA1 hasher
const hash = crypto.createHash('sha1')

// encode as hex (rather than binary)
hash.setEncoding('hex')

// send it some text
const text = process.argv[2]
hash.write(text)

// signal end of text
hash.end()

// display the result
const sha1sum = hash.read()
console.log(`SHA1 of "${text}" is ${sha1sum}`)
