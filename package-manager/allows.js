const configStr = require('./config-str')

const allows = (manifest, config) => {
  for (const [leftN, leftV] of Object.entries(config)) {
    const requirements = manifest[leftN][leftV]
    for (const [rightN, bVAll] of Object.entries(requirements)) {
      if (!bVAll.includes(config[rightN])) {
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

module.exports = allows
