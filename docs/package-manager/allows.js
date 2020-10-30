const configStr = require('./config-str')

const allows = (manifest, config) => {
  for (const [leftName, leftVer] of Object.entries(config)) {
    const requirements = manifest[leftName][leftVer]
    for (const [rightName, bVerAll] of Object.entries(requirements)) {
      if (!bVerAll.includes(config[rightName])) {
        console.log(`${configStr(config)} @ ${leftName}/${leftVer} ${rightName}/${config[rightName]}`)
        return false
      }
    }
  }
  console.log(configStr(config))
  return true
}

module.exports = allows
