/* eslint-disable no-eval */
const seen = {}

for (const name of ['x', 'y', 'z']) {
  const expr = `seen["${name}"] = "${name.toUpperCase()}"`
  eval(expr)
}

console.log(seen)
