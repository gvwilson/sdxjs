const Pledge = require('./pledge')

new Pledge((resolve, reject) => {
  console.log('3. top of action callback with double then and a catch')
  setTimeout(() => {
    console.log('3. about to call resolve callback')
    resolve('3. initial result')
    console.log('3. after resolve callback')
  }, 0)
  console.log('3. end of action callback')
}).then((value) => {
  console.log(`3. first then with "${value}"`)
  return '3. first then value'
}).then((value) => {
  console.log(`3. second then with "${value}" about to throw`)
  throw new Error(`3. exception from second then with "${value}"`)
}).catch((error) => {
  console.log(`3. in catch block with "${error}`)
})
