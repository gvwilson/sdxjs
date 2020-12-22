function * getNodes (here) {
  if (typeof here === 'string') {
    yield here
  } else if (Array.isArray(here)) {
    for (const child of here) {
      yield * getNodes(child)
    }
  } else {
    throw new Error(`unknown type "${typeof here}"`)
  }
}

export default getNodes
