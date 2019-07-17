let funcZero = () => console.log('funcZero')

let funcOne = (first) => console.log(`funcOne(${first})`)

let funcTwo = (first, second) => console.log(`funcTwo(${first}, ${second})`)

let funcError = () => {
  console.log('funcError')
  throw new Error('from funcError')
  console.log('should not reach this')
}

const runAll = (title) => {
  console.log(title)
  funcZero()
  funcOne(1)
  funcTwo(1, 2)
  try {
    funcError()
  } catch (error) {
    console.log(`caught ${error} as expected`)
  }
  console.log()
}

runAll('first time')

let replace = (func) => {
  return (...args) => {
    console.log('before')
    try {
      result = func(...args)
      console.log('after')
      return result
    } catch (error) {
      console.log('error')
      throw error
    }
  }
}

funcZero = replace(funcZero)
funcOne = replace(funcOne)
funcTwo = replace(funcTwo)
funcError = replace(funcError)

runAll('second time')
