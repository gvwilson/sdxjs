const allows = (manifest, configuration) => {
  for (const [upperName, upperVersion] of Object.entries(configuration)) {
    const requirements = manifest[upperName][upperVersion]
    for (const [lowerName, lowerVersions] of Object.entries(requirements)) {
      if (!lowerVersions.includes(configuration[lowerName])) {
        return false
      }
    }
  }
  return true
}

module.exports = allows
