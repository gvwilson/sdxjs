function* getNodes (here) {
  if (typeof here === 'string') {
    yield here
  }
  else if (Array.isArray(here)){
    for (const child of here) {
      yield* getNodes(child)
    }
  }
  else {
    throw new Exception(`unknown type "${typeof here}"`)
  }
}

module.exports = getNodes
