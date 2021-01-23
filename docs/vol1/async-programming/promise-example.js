const delay = (message) => {
  return new Promise((resolve, reject) => {
    console.log(`constructing promise: ${message}`)
    setTimeout(() => {
      resolve(`resolving: ${message}`)
    }, 1)
  })
}

console.log('before')
delay('outer delay')
  .then((value) => {
    console.log(`first then: ${value}`)
    return delay('inner delay')
  }).then((value) => {
    console.log(`second then: ${value}`)
  })
console.log('after')
