import fs from 'fs-extra-promise'

const firstTenCharacters = async (filename) => {
  const text = await fs.readFileAsync(filename, 'utf-8')
  console.log(`inside, raw text is ${text.length} characters long`)
  return text.slice(0, 10)
}

console.log('about to call')
const result = firstTenCharacters(process.argv[2])
console.log(`function result has type ${result.constructor.name}`)
result.then(value => console.log(`outside, final result is "${value}"`))
