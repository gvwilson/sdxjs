/* eslint-disable no-eval */
const fs = require('fs')

const main = () => {
  const source = fs.readFileSync(process.argv[2], 'utf-8')
  console.log('before', module)
  eval(source)
  console.log('after', module)
}

main()
