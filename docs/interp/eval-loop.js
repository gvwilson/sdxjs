// eslint-disable no-eval
const x = 1 // eslint-disable-line
const y = 3 // eslint-disable-line
const z = 5 // eslint-disable-line
for (const name of ['x', 'y', 'z', 'oops']) {
  const expr = `${name} + 1`
  console.log(name, '+ 1 =', eval(expr))
}
