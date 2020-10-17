const makeMakeRequire = (translate, creators, cache) => {
  return (absPath) => {
    return (localPath) => {
      const actualKey = translate[absPath][localPath]
      if (!(actualKey in cache)) {
        const func = creators[actualKey]
        const m = {}
        func(m)
        cache[actualKey] = m
      }
      return cache[actualKey]
    }
  }
}
