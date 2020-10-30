const allows = require('./allows')

const sweep = (manifest) => {
  const names = Object.keys(manifest)
  const result = []
  recurse(manifest, names, {}, result)
  return result
}

const recurse = (manifest, names, configuration, result) => {
  if (names.length === 0) {
    if (allows(manifest, configuration)) {
      result.push({ ...configuration })
    }
  } else {
    const next = names[0]
    const rest = names.slice(1)
    for (const version in manifest[next]) {
      configuration[next] = version
      recurse(manifest, rest, configuration, result)
    }
  }
}

module.exports = sweep
