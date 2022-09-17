// eslint-disable no-eval
const code = `
  const x = 'hello'
  console.log('x in eval is', x)
`

eval(code)
console.log('typeof x after eval', typeof x)
