const Pledge = require('./pledge')

new Pledge((resolve, reject) => {
  console.log('2. top of a single then clause')
  setTimeout(() => {
    console.log('2. about to call resolve callback')
    resolve('2. resolved result')
  }, 0)
}).then((value) => {
  console.log(`2. then with "${value}"`)
  return '2. first then value'
})
