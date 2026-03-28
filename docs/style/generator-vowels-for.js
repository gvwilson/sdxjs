function * getVowels (text) {
  for (const char of text) {
    if ('AEIOUaeiou'.includes(char)) {
      yield char
    }
  }
}

const test = 'this is a test'
// mccole:loop
for (const vowel of getVowels(test)) {
  console.log(vowel)
}
// mccole:/loop