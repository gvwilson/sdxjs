const createModule = () => {
  const privateValue = 'private value'
  const publicValue = 'public value'
  return { publicValue }
}

const contents = createModule()
console.log(`contents.publicValue is ${contents.publicValue}`)
console.log(`contents.privateValue is ${contents.privateValue}`)
