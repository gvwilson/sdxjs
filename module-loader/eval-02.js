const x = 1
const y = 3
const z = 5
for (const name of ['x', 'y', 'z']) {
  const expr = `${name} + 1`
  console.log(name, '+ 1 =', eval(expr))
}
