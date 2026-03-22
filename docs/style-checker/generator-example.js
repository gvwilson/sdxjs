function * threeWords () {
  yield 'first'
  yield 'second'
  yield 'third'
}

const gen = threeWords()

console.log(gen.next())
console.log(gen.next())
console.log(gen.next())
console.log(gen.next())
