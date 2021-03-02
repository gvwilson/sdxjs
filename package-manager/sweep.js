import configStr from './config-str.js'

const sweep = (manifest) => {
  const names = Object.keys(manifest)
  const result = []
  recurse(manifest, names, {}, result)
}

const recurse = (manifest, names, config, result) => {
  if (names.length === 0) {
    if (allows(manifest, config)) {
      result.push({ ...config })
    }
  } else {
    const next = names[0]
    const rest = names.slice(1)
    for (const version in manifest[next]) {
      config[next] = version
      recurse(manifest, rest, config, result)
    }
  }
}

// [allows]
const allows = (manifest, config) => {
  for (const [leftN, leftV] of Object.entries(config)) {
    const requirements = manifest[leftN][leftV]
    for (const [rightN, rightVAll] of Object.entries(requirements)) {
      if (!rightVAll.includes(config[rightN])) {
        const title = configStr(config)
        const missing = config[rightN]
        console.log(`${title} @ ${leftN}/${leftV} ${rightN}/${missing}`)
        return false
      }
    }
  }
  console.log(configStr(config))
  return true
}
// [/allows]

export default sweep
