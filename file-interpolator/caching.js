/* eslint-disable */
class Cache {
  // ...
  interpolate (fileDir, outer) {
    return outer.replace(Cache.INTERPOLATE_PAT,
                         (match, comment, filename) => {
      filename = filename.trim()
      const filePath = path.join(fileDir, filename)
      if (!fs.existsSync(filePath)) {
        throw new Error(`Cannot find ${filePath}`)
      }
      const inner = fs.readFileSync(filePath, 'utf-8')
      return inner
    })
  }
  // ...
}
Cache.INTERPOLATE_PAT = /\/\*\+(.+?)\+(.+?)\+\*\//g
