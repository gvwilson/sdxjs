// [original]
let zero = () => console.log('zero')

let one = (first) => console.log(`one(${first})`)

let two = (first, second) => console.log(`two(${first}, ${second})`)

let error = () => {
  console.log('error')
  throw new Error('from error')
  console.log('should not reach this') // eslint-disable-line
}

const runAll = (title) => {
  console.log(title)
  zero()
  one(1)
  two(1, 2)
  try {
    error()
  } catch (error) {
    console.log(`caught ${error} as expected`)
  }
  console.log()
}

runAll('first time')
// [/original]

// [replace]
const replace = (func) => {
  return (...args) => {
    console.log('before')
    try {
      const result = func(...args)
      console.log('after')
      return result
    } catch (error) {
      console.log('error')
      throw error
    }
  }
}

zero = replace(zero)
one = replace(one)
two = replace(two)
error = replace(error)

runAll('second time')
// [/replace]
