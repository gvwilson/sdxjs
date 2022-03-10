const publicValue = 'public value'

const privateValue = 'private value'

const publicFunction = (caller) => {
  return `publicFunction called from ${caller}`
}

module.exports = { publicValue, publicFunction }
