import Pledge from './pledge.js'

new Pledge((resolve, reject) => {
  console.log('top of a single then clause')
  setTimeout(() => {
    console.log('about to call resolve callback')
    resolve('this is the result')
  }, 0)
}).then((value) => {
  console.log(`in 'then' with "${value}"`)
  return 'first then value'
})
