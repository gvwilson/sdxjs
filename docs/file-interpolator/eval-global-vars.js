/* eslint-disable no-eval */
let x = 'original' // eslint-disable-line
eval('x = "modified"')
console.log('x after eval is', x)
