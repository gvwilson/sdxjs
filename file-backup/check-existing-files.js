import glob from 'glob-promise'
import path from 'path'

const findNew = async (rootDir, pathHashPairs) => {
  const hashToPath = pathHashPairs.reduce((obj, [path, hash]) => {
    obj[hash] = path
    return obj
  }, {})

  const pattern = `${rootDir}/*.bck`
  const options = {}
  const existingFiles = await glob(pattern, options)

  existingFiles.forEach(filename => {
    const stripped = path.basename(filename).replace(/\.bck$/, '')
    delete hashToPath[stripped]
  })

  return hashToPath
}

export default findNew
