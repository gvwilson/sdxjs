const contents = (() => {
  const privateValue = 'private value' // eslint-disable-line
  const publicValue = 'public value'
  return { publicValue }
})()

console.log(`contents.publicValue is ${contents.publicValue}`)
console.log(`contents.privateValue is ${contents.privateValue}`)
