const Pledge = require('./pledge')

new Pledge((resolve, reject) => {
  console.log('4. top of action callback with deliberate error')
  setTimeout(() => {
    console.log('4. about to reject on purpose')
    reject('4. error on purpose')
  }, 0)
}).then((value) => {
  console.log(`4. should not be here with "${value}"`)
}).catch((error) => {
  console.log(`4. in error handler with "${error}"`)
})
