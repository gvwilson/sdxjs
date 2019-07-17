const Pledge = require('./pledge')

new Pledge((resolve, reject) => {
  console.log('1. top of a single then clause')
}).then((value) => {
  console.log(`1. then with "${value}"`)
  return '1. first then value'
})
