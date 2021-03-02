import configStr from './config-str.js'

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
      config[next] = version
      if (compatible(manifest, config)) {
        recurse(manifest, rest, config, result)
      }
      delete config[next]
    }
  }
}

// [compatible]
const compatible = (manifest, config) => {
  for (const [leftN, leftV] of Object.entries(config)) {
    const leftR = manifest[leftN][leftV]
    for (const [rightN, rightV] of Object.entries(config)) {
      if ((rightN in leftR) && (!leftR[rightN].includes(rightV))) {
        report(config, leftN, leftV, rightN, rightV)
        return false
      }
      const rightR = manifest[rightN][rightV]
      if ((leftN in rightR) && (!rightR[leftN].includes(leftV))) {
        report(config, leftN, leftV, rightN, rightV)
        return false
      }
    }
  }
  return true
}
// [/compatible]

const report = (config, leftN, leftV, rightN, rightV) => {
  const title = configStr(config)
  console.log(`${title} @ ${leftN}/${leftV} ${rightN}/${rightV}`)
}

export default prune
