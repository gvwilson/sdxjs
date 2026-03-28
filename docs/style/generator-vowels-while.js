function * getVowels (text) {
  for (const char of text) {
    if ('AEIOUaeiou'.includes(char)) {
      yield char
    }
  }
}

const test = 'this is a test'
const gen = getVowels(test)
let current = gen.next()
while (!current.done) {
  console.log(current.value)
  current = gen.next()
}
