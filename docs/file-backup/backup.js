const fs = require('fs-extra-promise')

const hashExisting = require('./hash-existing-async')
const findNewFiles = require('./check-existing-files')

const backup = async (src, dst, timestamp = null) => {
  if (timestamp === null) {
    timestamp = Math.round((new Date()).getTime() / 1000)
  }
  timestamp = String(timestamp).padStart(10, '0')

  const existing = await hashExisting(src)
  const needToCopy = await findNewFiles(dst, existing)
  await copyFiles(dst, needToCopy)
  await saveManifest(dst, timestamp, existing)
}

const copyFiles = async (dst, needToCopy) => {
  const promises = Object.keys(needToCopy).map(hash => {
    const srcPath = needToCopy[hash]
    const dstPath = `${dst}/${hash}.bck`
    fs.copyFileAsync(srcPath, dstPath)
  })
  return Promise.all(promises)
}

const saveManifest = async (dst, timestamp, pathHash) => {
  pathHash = pathHash.sort()
  const content = pathHash.map(
    ([path, hash]) => `${path},${hash}`).join('\n')
  const manifest = `${dst}/${timestamp}.csv`
  fs.writeFileAsync(manifest, content, 'utf-8')
}

module.exports = backup
