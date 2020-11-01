const configStr = require('./config-str')

const prune = (manifest) => {
  const names = Object.keys(manifest)
  const result = []
  recurse(manifest, names, {}, result)
  for (const config of result) {
    console.log(configStr(config))
  }
}

const recurse = (manifest, names, config, result) => {
  if (names.length === 0) {
    result.push({ ...config })
  } else {
    const next = names[0]
    const rest = names.slice(1)
    for (const version in manifest[next]) {
      if (compatible(manifest, config, next, version)) {
        config[next] = version
        recurse(manifest, rest, config, result)
        delete config[next]
      }
    }
  }
}

// <compatible>
const compatible = (manifest, config, next, version) => {
  for (const [oldN, oldV] of Object.entries(config)) {
    const requirements = manifest[oldN][oldV]
    if (!requirements[next].includes(version)) {
      const temp = { ...config }
      temp[next] = version
      const title = configStr(temp)
      console.log(`${title} @ ${oldN}/${oldV} ${next}/${version}`)
      return false
    }
  }
  return true
}
// </compatible>

module.exports = prune
