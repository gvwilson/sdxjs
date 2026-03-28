import Pledge from './pledge.js'

new Pledge((resolve, reject) => {
  console.log('top of a single then clause')
}).then((value) => {
  console.log(`then with "${value}"`)
  return 'first then value'
})
